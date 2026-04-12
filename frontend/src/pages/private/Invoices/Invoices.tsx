import { useEffect, useMemo, useState } from "react";
import { Button, Chip, ChipProps } from "@mui/material";
import { AddRounded, OpenInNewRounded } from "@mui/icons-material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import {
  useGetInvoiceStatesQuery,
  useGetInvoicesViewQuery,
  useGetMeasureUnitsQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { Column, DataGridRowAction, DetailColumn, GetList } from "src/types";
import { VInvoicesResponse } from "src/types/pocketbase-types";
import { formatDate, formatMoney, formatPercent } from "src/utils/format";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { invoiceBreadcrumbFlow } from "./breadcrumbFlow";

type InvoiceState = "void" | "draft" | "open";

const invoiceStateMeta: Record<
  InvoiceState,
  { color: ChipProps["color"]; label: string }
> = {
  void: { color: "error", label: "Cancelada" },
  draft: { color: "info", label: "Borrador" },
  open: { color: "success", label: "Confirmada" },
};

const parseJsonValue = <T,>(value: unknown): T | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as T;
  return null;
};

const getInvoiceStateValue = (
  item: VInvoicesResponse,
  stateNameById: Map<string, string>,
) => {
  const state = (item as VInvoicesResponse & { state?: unknown }).state;

  if (typeof state === "string") {
    const parsedState = parseJsonValue<{ id?: string; name?: string }>(state);
    if (parsedState?.name) return String(parsedState.name).toLowerCase();
    if (parsedState?.id && stateNameById.has(parsedState.id)) {
      return String(stateNameById.get(parsedState.id)).toLowerCase();
    }

    if (stateNameById.has(state)) {
      return String(stateNameById.get(state)).toLowerCase();
    }

    return state.toLowerCase();
  }

  if (state && typeof state === "object" && "name" in state) {
    const stateName = (state as { name?: unknown }).name;
    return typeof stateName === "string" ? stateName.toLowerCase() : "";
  }

  if (state && typeof state === "object" && "id" in state) {
    const stateId = (state as { id?: unknown }).id;
    if (typeof stateId === "string" && stateNameById.has(stateId)) {
      return String(stateNameById.get(stateId)).toLowerCase();
    }
  }

  return "";
};

const translateInvoiceState = (state: string) => {
  if (state in invoiceStateMeta) {
    return invoiceStateMeta[state as InvoiceState];
  }
  return { color: "default" as const, label: state || "-" };
};

export default function Invoices() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    orderBy: "created",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(invoiceBreadcrumbFlow.list()));

    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetInvoicesViewQuery(queryArgs);
  const { data: invoiceStates = [] } = useGetInvoiceStatesQuery();
  const { data: products = [] } = useGetProductsQuery();
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery();

  const stateNameById = useMemo(
    () =>
      new Map(
        invoiceStates.map((state) => [state.id, String(state.name || "")]),
      ),
    [invoiceStates],
  );

  const measureUnitNameById = useMemo(
    () =>
      new Map(measureUnits.map((unit) => [unit.id, String(unit.name || "-")])),
    [measureUnits],
  );

  const productMeasureUnitByProductId = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          measureUnitNameById.get(String(product.measure_unit || "")) || "-",
        ]),
      ),
    [products, measureUnitNameById],
  );

  const columns: Column = useMemo(
    () => [
      {
        id: "date",
        label: "Fecha",
        align: "left",
        minWidth: 160,
        render: (item: VInvoicesResponse) => formatDate(item.date),
      },
      {
        id: "client",
        label: "Cliente",
        align: "left",
        minWidth: 220,
        render: (item: VInvoicesResponse) => {
          const client = item.client as { name?: string } | string | null;
          if (typeof client === "string") return client;
          if (client && typeof client === "object" && client.name) {
            return client.name;
          }
          return "-";
        },
        disableSort: true,
      },
      {
        id: "discount",
        label: "Descuento",
        minWidth: 140,
        disableSort: true,
        render: (item: VInvoicesResponse) => formatPercent(item.discount),
      },
      {
        id: "total",
        label: "Total",
        minWidth: 140,
        disableSort: true,
        render: (item: VInvoicesResponse) => formatMoney(item.total),
      },
      {
        id: "state",
        label: "Estado",
        minWidth: 160,
        disableSort: true,
        render: (item: VInvoicesResponse) => {
          const state = getInvoiceStateValue(item, stateNameById);
          const { color, label } = translateInvoiceState(state);

          return (
            <Chip
              size="small"
              variant="outlined"
              color={color}
              label={label}
            />
          );
        },
      },
    ],
    [stateNameById],
  );

  const detailColumns: DetailColumn = useMemo(
    () => [
      {
        id: "invoice_products",
        title: "Productos",
        columns: [
          {
            id: "product",
            label: "Producto",
            align: "left",
            minWidth: 180,
            render: (item: any) => {
              if (item?.product_name) return item.product_name;
              const product = item?.product as
                | { name?: string }
                | string
                | null;
              if (typeof product === "string") return product;
              if (product && typeof product === "object" && product.name) {
                return product.name;
              }
              return "-";
            },
          },
          {
            id: "amount",
            label: "Cantidad",
            minWidth: 120,
          },
          {
            id: "measure_unit",
            label: "Unidad",
            minWidth: 110,
            render: (item: any) =>
              productMeasureUnitByProductId.get(
                String(item?.product_id || ""),
              ) || "-",
          },
          {
            id: "unit_price",
            label: "Precio Unit.",
            minWidth: 130,
            render: (item: any) => formatMoney(item?.unit_price),
          },
          {
            id: "discount",
            label: "Desc. %",
            minWidth: 100,
            render: (item: any) => formatPercent(item?.discount),
          },
          {
            id: "total",
            label: "Total",
            minWidth: 120,
            render: (item: any) => formatMoney(item?.total),
          },
        ],
      },
    ],
    [productMeasureUnitByProductId],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "open",
        label: "Abrir factura",
        icon: <OpenInNewRounded fontSize="small" color="primary" />,
        onClick: (item) => handleGoTo(`${AppRoutes.Invoices}/${item.id}`),
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
      detailColumns={detailColumns}
      // hasCheckbox
      hasSearch
      searchPlaceholder="Buscar factura"
      initialQuery={queryArgs}
      onQueryChange={setQueryArgs}
      rowActions={rowActions}
      toolbarElement={
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => handleGoTo(AppRoutes.InvoicesNew)}
        >
          Crear factura
        </Button>
      }
    />
  );
}
