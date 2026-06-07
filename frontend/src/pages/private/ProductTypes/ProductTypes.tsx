import { useEffect, useMemo, useState } from "react";
import { AddRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import DeleteEntityDialog from "src/components/common/DeleteEntityDialog";
import { getListArgsInitialState } from "src/constants";
import {
  useDeleteProductTypeMutation,
  useGetProductTypesListQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { Column, DataGridRowAction, GetList } from "src/types";
import { ProductTypesResponse } from "src/types/pocketbase-types";
import { productTypesBreadcrumbFlow } from "./breadcrumbFlow";
import { buildCrudRowActions } from "../crudListUtils";

export default function ProductTypes() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [productTypeToDelete, setProductTypeToDelete] =
    useState<ProductTypesResponse | null>(null);
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(productTypesBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetProductTypesListQuery(queryArgs);
  const [deleteProductType, { isLoading: isDeleting }] =
    useDeleteProductTypeMutation();

  const handleDelete = async () => {
    if (!productTypeToDelete) return;

    try {
      await deleteProductType(productTypeToDelete.id).unwrap();
      dispatch(
        setSnackbar({
          message: "Tipo de producto eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setProductTypeToDelete(null);
    } catch {
      dispatch(
        setSnackbar({
          message: "No se pudo eliminar el tipo de producto.",
          type: "error",
        }),
      );
    }
  };

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Nombre",
        align: "left",
        minWidth: 260,
        width: "100%",
      },
    ],
    [],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () =>
      buildCrudRowActions<ProductTypesResponse>({
        entityLabel: "tipo de producto",
        baseRoute: AppRoutes.ConfigProductTypes,
        handleGoTo,
        onDelete: setProductTypeToDelete,
      }),
    [handleGoTo],
  );

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={columns}
        hasSearch
        searchPlaceholder="Buscar tipo de producto"
        initialQuery={queryArgs}
        onQueryChange={setQueryArgs}
        rowActions={rowActions}
        toolbarElement={
          <Button
            size="small"
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => handleGoTo(AppRoutes.ConfigProductTypesNew)}
          >
            Crear tipo de producto
          </Button>
        }
      />
      <DeleteEntityDialog
        open={Boolean(productTypeToDelete)}
        title="Eliminar tipo de producto"
        message="¿Seguro que querés eliminar este tipo de producto?"
        isDeleting={isDeleting}
        onClose={() => setProductTypeToDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
