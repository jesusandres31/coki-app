import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import {
  AddRounded,
  OpenInNewRounded,
  PrintRounded,
} from "@mui/icons-material";
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
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import {
  formatDate,
  formatPercent,
  MoneyValue,
} from "src/utils/format";
import { buildMeasureUnitNameById } from "src/utils/measureUnits";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { useAppDispatch } from "src/app/store";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { invoiceBreadcrumbFlow } from "./breadcrumbFlow";
import {
  buildInvoicePdfModel,
  openInvoicePdfInViewer,
  openInvoicePdfTab,
} from "./pdf";

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
  const [printingInvoiceId, setPrintingInvoiceId] = useState("");
  const [triggerGetInvoiceProducts] =
    useLazyGetInvoiceProductsByInvoiceIdQuery();

  useEffect(() => {
    dispatch(setBreadcrumbs(invoiceBreadcrumbFlow.list()));

    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetInvoicesListQuery(queryArgs);
  const { data: clients = [], isFetching: isFetchingClients } =
    useGetClientsQuery();
  const { data: products = [], isFetching: isFetchingProducts } =
    useGetProductsQuery();
  const { data: measureUnits = [], isFetching: isFetchingMeasureUnits } =
    useGetMeasureUnitsQuery();
  const isLoadingInvoiceGridData =
    isFetching ||
    isFetchingClients ||
    isFetchingProducts ||
    isFetchingMeasureUnits;

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

  const getInvoiceProducts = useCallback(
    async (invoiceId: string) => {
      const cachedProducts = invoiceProductsByInvoiceId[invoiceId];
      if (cachedProducts) return cachedProducts;

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
        return items;
      } catch {
        setInvoiceProductsByInvoiceId((prev) => ({
          ...prev,
          [invoiceId]: [],
        }));
        throw new Error("No se pudieron cargar los productos de la factura.");
      } finally {
        setInvoiceProductsLoadingByInvoiceId((prev) => ({
          ...prev,
          [invoiceId]: false,
        }));
      }
    },
    [invoiceProductsByInvoiceId, triggerGetInvoiceProducts],
  );

  const handlePrintInvoice = useCallback(
    async (invoice: InvoiceListRow) => {
      if (printingInvoiceId) return;

      const popup = openInvoicePdfTab();

      if (!popup) {
        dispatch(
          setSnackbar({
            message:
              "No se pudo abrir el PDF en una pestaña nueva. Verificá el bloqueo de popups.",
            type: "error",
          }),
        );
        return;
      }

      setPrintingInvoiceId(invoice.id);

      try {
        const invoiceProducts = await getInvoiceProducts(invoice.id);
        const clientName = clientNameById.get(String(invoice.client || ""));
        const invoicePdfModel = buildInvoicePdfModel({
          invoice: {
            ...invoice,
            client: JSON.stringify({
              id: invoice.client,
              name: clientName || "-",
            }),
            invoice_products: JSON.stringify(invoiceProducts),
          } as VInvoicesResponse,
          products,
          measureUnits,
        });

        await openInvoicePdfInViewer(invoicePdfModel, popup);
      } catch {
        popup.close();
        dispatch(
          setSnackbar({
            message: "No se pudo generar o abrir el PDF de la factura.",
            type: "error",
          }),
        );
      } finally {
        setPrintingInvoiceId("");
      }
    },
    [
      clientNameById,
      dispatch,
      getInvoiceProducts,
      measureUnits,
      printingInvoiceId,
      products,
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
        render: (item: InvoiceListRow) => <MoneyValue value={item.total} />,
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
            render: (item: any) => <MoneyValue value={item?.unit_price} />,
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
            render: (item: any) => <MoneyValue value={item?.total} />,
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
      {
        id: "print",
        label: "Imprimir factura",
        icon: <PrintRounded fontSize="small" sx={{ color: "text.primary" }} />,
        onClick: (item) => void handlePrintInvoice(item as InvoiceListRow),
      },
    ],
    [handleGoTo, handlePrintInvoice],
  );

  return (
    <DataGrid
      data={invoicesData}
      error={error}
      isFetching={isLoadingInvoiceGridData}
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
