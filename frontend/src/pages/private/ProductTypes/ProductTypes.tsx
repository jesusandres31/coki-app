import { useEffect, useMemo, useState } from "react";
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
import { formatUpdatedAt } from "src/utils/format";

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
        width: "70%",
      },
      {
        id: "updated",
        hideOnMobile: true,
        label: "Actualizado",
        align: "left",
        minWidth: 190,
        width: "30%",
        render: (item: ProductTypesResponse) => formatUpdatedAt(item.updated),
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
        createAction={{
          label: "Crear tipo de producto",
          onClick: () => handleGoTo(AppRoutes.ConfigProductTypesNew),
        }}
      />
      <DeleteEntityDialog
        open={Boolean(productTypeToDelete)}
        title="Eliminar tipo de producto"
        message={`¿Confirmás eliminar el tipo de producto "${productTypeToDelete?.name || ""}"?`}
        isDeleting={isDeleting}
        onClose={() => setProductTypeToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
