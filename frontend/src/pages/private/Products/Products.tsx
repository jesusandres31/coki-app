import { useEffect, useMemo, useState } from "react";
import { OpenInNewRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { AddRounded } from "@mui/icons-material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import {
  useGetMeasureUnitsQuery,
  useGetProductsListQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { ProductsResponse } from "src/types/pocketbase-types";
import { formatMoney } from "src/utils/format";
import { Column, DataGridRowAction, GetList } from "src/types";
import { productsBreadcrumbFlow } from "./breadcrumbFlow";

export default function Products() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
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
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery();

  const measureUnitById = useMemo(
    () =>
      new Map(measureUnits.map((item) => [item.id, String(item.name || "-")])),
    [measureUnits],
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
        label: "Precio",
        minWidth: 150,
        render: (item: ProductsResponse) => formatMoney(item.unit_price),
      },
      {
        id: "measure_unit",
        label: "Unidad de medida",
        align: "left",
        minWidth: 200,
        disableSort: true,
        render: (item: ProductsResponse) =>
          measureUnitById.get(String(item.measure_unit || "")) || "-",
      },
    ],
    [measureUnitById],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "open",
        label: "Abrir producto",
        icon: <OpenInNewRounded fontSize="small" color="primary" />,
        onClick: (item) => handleGoTo(`${AppRoutes.Products}/${item.id}`),
      },
    ],
    [handleGoTo],
  );

  return (
    <DataGrid
      data={data}
      error={error}
      isFetching={isFetching}
      columns={columns}
      hasSearch
      searchPlaceholder="Buscar producto"
      initialQuery={queryArgs}
      onQueryChange={setQueryArgs}
      rowActions={rowActions}
      toolbarElement={
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => handleGoTo(AppRoutes.ProductsNew)}
        >
          Crear producto
        </Button>
      }
    />
  );
}
