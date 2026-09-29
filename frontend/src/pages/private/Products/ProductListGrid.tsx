import { useMemo, useState } from "react";
import {
  useGetMeasureUnitsQuery,
  useGetProductTypesListQuery,
  useGetProductsListQuery,
} from "src/app/services/invoiceService";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import { Column, DataGridRowAction, GetList } from "src/types";
import { ProductsResponse } from "src/types/pocketbase-types";
import { formatUpdatedAt, MoneyValue } from "src/utils/format";
import { buildMeasureUnitNameById } from "src/utils/measureUnits";

interface ProductListGridProps {
  rowActions: DataGridRowAction[];
  createAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function ProductListGrid({
  rowActions,
  createAction,
}: ProductListGridProps) {
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  const { data, error, isFetching } = useGetProductsListQuery(queryArgs);
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
        minWidth: 200,
        disableSort: true,
        render: (item: ProductsResponse) =>
          measureUnitById.get(String(item.measure_unit || "")) || "-",
      },
      {
        id: "product_type",
        hideOnMobile: true,
        label: "Tipo Prod.",
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

  return (
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
      createAction={createAction}
    />
  );
}
