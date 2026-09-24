import { useEffect, useMemo, useState } from "react";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import DeleteEntityDialog from "src/components/common/DeleteEntityDialog";
import { getListArgsInitialState } from "src/constants";
import {
  useDeleteProductMutation,
  useGetMeasureUnitsQuery,
  useGetProductTypesListQuery,
  useGetProductsListQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { ProductsResponse } from "src/types/pocketbase-types";
import { formatUpdatedAt, MoneyValue } from "src/utils/format";
import { buildMeasureUnitNameById } from "src/utils/measureUnits";
import { Column, DataGridRowAction, GetList } from "src/types";
import { productsBreadcrumbFlow } from "./breadcrumbFlow";
import { buildCrudRowActions } from "../crudListUtils";

export default function Products() {
  const dispatch = useAppDispatch();
  const { handleGoTo, handleGoToFromCurrent } = useRouter();
  const [productToDelete, setProductToDelete] =
    useState<ProductsResponse | null>(null);
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(productsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetProductsListQuery(queryArgs);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const { data: measureUnits = [], isFetching: isFetchingMeasureUnits } =
    useGetMeasureUnitsQuery();
  const { data: productTypesList, isFetching: isFetchingProductTypes } =
    useGetProductTypesListQuery({
      page: 1,
      perPage: 500,
      order: "asc",
      orderBy: "name",
    });
  const productTypes = productTypesList?.items || [];
  const isLoadingProductGridData =
    isFetching || isFetchingMeasureUnits || isFetchingProductTypes;

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id).unwrap();
      dispatch(
        setSnackbar({
          message: "Producto eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setProductToDelete(null);
    } catch {
      dispatch(
        setSnackbar({
          message: "No se pudo eliminar el producto.",
          type: "error",
        }),
      );
    }
  };

  const measureUnitById = useMemo(
    () => buildMeasureUnitNameById(measureUnits),
    [measureUnits],
  );
  const productTypeNameById = useMemo(
    () =>
      new Map(productTypes.map((item) => [item.id, String(item.name || "-")])),
    [productTypes],
  );

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Nombre",
        align: "left",
        minWidth: 220,
      },
      {
        id: "unit_price",
        mobileWidth: "35%",
        label: "Precio",
        type: "number",
        minWidth: 150,
        render: (item: ProductsResponse) => (
          <MoneyValue value={item.unit_price} />
        ),
      },
      {
        id: "measure_unit",
        mobileWidth: 48,
        mobileLabel: "Ud.",
        label: "Ud. medida",
        // align: "left",
        minWidth: 200,
        disableSort: true,
        render: (item: ProductsResponse) =>
          measureUnitById.get(String(item.measure_unit || "")) || "-",
      },
      {
        id: "product_type",
        hideOnMobile: true,
        label: "Tipo Prod.",
        // align: "left",
        minWidth: 260,
        disableSort: true,
        render: (item: ProductsResponse) => {
          const typeNames = (
            Array.isArray(item.product_type) ? item.product_type : []
          )
            .map((typeId) => productTypeNameById.get(typeId))
            .filter((name): name is string => Boolean(name && name !== "-"));

          return typeNames.length > 0 ? typeNames.join(", ") : "-";
        },
      },
      {
        id: "updated",
        hideOnMobile: true,
        label: "Actualizado",
        align: "left",
        minWidth: 230,
        render: (item: ProductsResponse) => formatUpdatedAt(item.updated),
      },
    ],
    [measureUnitById, productTypeNameById],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () =>
      buildCrudRowActions<ProductsResponse>({
        entityLabel: "producto",
        baseRoute: AppRoutes.Products,
        handleGoTo: (path) => handleGoToFromCurrent(path, "Productos"),
        onDelete: setProductToDelete,
      }),
    [handleGoToFromCurrent],
  );

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isLoadingProductGridData}
        columns={columns}
        hasSearch
        searchPlaceholder="Buscar producto"
        initialQuery={queryArgs}
        onQueryChange={setQueryArgs}
        rowActions={rowActions}
        createAction={{
          label: "Crear producto",
          onClick: () => handleGoTo(AppRoutes.ProductsNew),
        }}
      />
      <DeleteEntityDialog
        open={Boolean(productToDelete)}
        title="Eliminar producto"
        message={`¿Confirmás eliminar el producto "${productToDelete?.name || ""}"?`}
        isDeleting={isDeleting}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
