import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import { AddRounded, OpenInNewRounded } from "@mui/icons-material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import {
  useGetClientsQuery,
  useGetInvoicesListQuery,
  useGetMeasureUnitsQuery,
  useLazyGetInvoiceProductsByInvoiceIdQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { Column, DataGridRowAction, DetailColumn, GetList } from "src/types";
import {
  InvoicesProductsResponse,
  InvoicesResponse,
} from "src/types/pocketbase-types";
import { formatDate, formatMoney, formatPercent } from "src/utils/format";
import { buildMeasureUnitNameById } from "src/utils/measureUnits";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { invoiceBreadcrumbFlow } from "./breadcrumbFlow";

interface InvoiceListRow extends InvoicesResponse {
  invoice_products?: InvoicesProductsResponse[];
  invoice_products_loading?: boolean;
}

export default function Invoices() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    orderBy: "created",
  }));
  const [invoiceProductsByInvoiceId, setInvoiceProductsByInvoiceId] = useState<
    Record<string, InvoicesProductsResponse[]>
  >({});
  const [
    invoiceProductsLoadingByInvoiceId,
    setInvoiceProductsLoadingByInvoiceId,
  ] = useState<Record<string, boolean>>({});
  const [triggerGetInvoiceProducts] =
    useLazyGetInvoiceProductsByInvoiceIdQuery();

  useEffect(() => {
    dispatch(setBreadcrumbs(invoiceBreadcrumbFlow.list()));

    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetInvoicesListQuery(queryArgs);
  const { data: clients = [] } = useGetClientsQuery();
  const { data: products = [] } = useGetProductsQuery();
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery();

  const clientNameById = useMemo(
    () =>
      new Map(clients.map((client) => [client.id, String(client.name || "-")])),
    [clients],
  );

  const measureUnitNameById = useMemo(
    () => buildMeasureUnitNameById(measureUnits),
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

  const productNameById = useMemo(
    () =>
      new Map(
        products.map((product) => [product.id, String(product.name || "-")]),
      ),
    [products],
  );

  const invoicesData = useMemo(() => {
    if (!data) return undefined;

    return {
      ...data,
      items: data.items.map((invoice) => ({
        ...invoice,
        invoice_products: invoiceProductsByInvoiceId[invoice.id],
        invoice_products_loading: Boolean(
          invoiceProductsLoadingByInvoiceId[invoice.id],
        ),
      })) as InvoiceListRow[],
    };
  }, [data, invoiceProductsByInvoiceId, invoiceProductsLoadingByInvoiceId]);

  const handleCollapseChange = useCallback(
    async (invoiceId: string, collapsed: boolean) => {
      if (!collapsed) return;
      if (invoiceProductsByInvoiceId[invoiceId]) return;
      if (invoiceProductsLoadingByInvoiceId[invoiceId]) return;

      setInvoiceProductsLoadingByInvoiceId((prev) => ({
        ...prev,
        [invoiceId]: true,
      }));

      try {
        const items = await triggerGetInvoiceProducts(invoiceId).unwrap();
        setInvoiceProductsByInvoiceId((prev) => ({
          ...prev,
          [invoiceId]: items,
        }));
      } catch {
        setInvoiceProductsByInvoiceId((prev) => ({
          ...prev,
          [invoiceId]: [],
        }));
      } finally {
        setInvoiceProductsLoadingByInvoiceId((prev) => ({
          ...prev,
          [invoiceId]: false,
        }));
      }
    },
    [
      invoiceProductsByInvoiceId,
      invoiceProductsLoadingByInvoiceId,
      triggerGetInvoiceProducts,
    ],
  );

  const columns: Column = useMemo(
    () => [
      {
        id: "date",
        label: "Fecha",
        align: "left",
        minWidth: 160,
        render: (item: InvoiceListRow) => formatDate(item.date),
      },
      {
        id: "client",
        label: "Cliente",
        align: "left",
        minWidth: 220,
        render: (item: InvoiceListRow) =>
          clientNameById.get(String(item.client || "")) || "-",
        disableSort: true,
      },
      {
        id: "discount",
        label: "Descuento",
        minWidth: 140,
        disableSort: true,
        render: (item: InvoiceListRow) => formatPercent(item.discount),
      },
      {
        id: "total",
        label: "Total",
        minWidth: 140,
        disableSort: true,
        render: (item: InvoiceListRow) => formatMoney(item.total),
      },
    ],
    [clientNameById],
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
            width: "42%",
            minWidth: 180,
            render: (item: any) => {
              const productId = String(item?.product || item?.product_id || "");
              return productNameById.get(productId) || "-";
            },
          },
          {
            id: "amount",
            label: "Cantidad",
            width: 90,
            minWidth: 80,
          },
          {
            id: "measure_unit",
            label: "Unidad",
            width: 90,
            minWidth: 80,
            render: (item: any) =>
              productMeasureUnitByProductId.get(
                String(item?.product || item?.product_id || ""),
              ) || "-",
          },
          {
            id: "unit_price",
            label: "Precio Unit.",
            width: 105,
            minWidth: 95,
            render: (item: any) => formatMoney(item?.unit_price),
          },
          {
            id: "discount",
            label: "Desc. %",
            width: 90,
            minWidth: 80,
            render: (item: any) => formatPercent(item?.discount),
          },
          {
            id: "total",
            label: "Total",
            align: "left",
            width: 120,
            minWidth: 110,
            render: (item: any) => formatMoney(item?.total),
          },
        ],
      },
    ],
    [productMeasureUnitByProductId, productNameById],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "open",
        label: "Ver factura",
        icon: <OpenInNewRounded fontSize="small" color="primary" />,
        onClick: (item) => handleGoTo(`${AppRoutes.Invoices}/${item.id}`),
      },
    ],
    [handleGoTo],
  );

  return (
    <DataGrid
      data={invoicesData}
      error={error}
      isFetching={isFetching}
      columns={columns}
      detailColumns={detailColumns}
      // hasCheckbox
      hasSearch
      searchPlaceholder="Buscar factura"
      initialQuery={queryArgs}
      onQueryChange={setQueryArgs}
      onCollapseChange={handleCollapseChange}
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
