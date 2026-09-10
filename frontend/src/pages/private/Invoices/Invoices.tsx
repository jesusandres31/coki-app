import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import {
  AddRounded,
  EditRounded,
  OpenInNewRounded,
  PrintRounded,
} from "@mui/icons-material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import {
  useGetInvoicesListQuery,
  useLazyGetInvoiceProductsByInvoiceIdQuery,
} from "src/app/services/invoiceService";
import { Column, DataGridRowAction, DetailColumn, GetList } from "src/types";
import {
  ClientsResponse,
  InvoicesProductsResponse,
  InvoicesResponse,
  MeasureunitsResponse,
  ProductsResponse,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import {
  formatDate,
  formatPercent,
  MoneyValue,
} from "src/utils/format";
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

interface InvoiceListRow
  extends InvoicesResponse<{ client?: ClientsResponse }> {
  invoice_products?: InvoiceProductListRow[];
  invoice_products_loading?: boolean;
}

interface InvoiceProductListRow
  extends InvoicesProductsResponse<{
    product?: ProductsResponse<{ measure_unit?: MeasureunitsResponse }>;
  }> {}

const getInvoiceClientName = (invoice: InvoiceListRow) => {
  const expandedName = invoice.expand?.client?.name;
  return expandedName ? String(expandedName) : "-";
};

export default function Invoices() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    orderBy: "created",
  }));
  const [invoiceProductsByInvoiceId, setInvoiceProductsByInvoiceId] = useState<
    Record<string, InvoiceProductListRow[]>
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
        const items = (await triggerGetInvoiceProducts(
          invoiceId,
        ).unwrap()) as InvoiceProductListRow[];
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
        const items = (await triggerGetInvoiceProducts(
          invoiceId,
        ).unwrap()) as InvoiceProductListRow[];
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
        const clientName = getInvoiceClientName(invoice);
        const invoicePdfModel = buildInvoicePdfModel({
          invoice: {
            ...invoice,
            client: JSON.stringify({
              id: invoice.client,
              name: clientName,
            }),
            invoice_products: JSON.stringify(invoiceProducts),
          } as VInvoicesResponse,
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
      dispatch,
      getInvoiceProducts,
      printingInvoiceId,
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
          getInvoiceClientName(item),
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
    [],
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
              return item?.expand?.product?.name || "-";
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
              item?.expand?.product?.expand?.measure_unit?.name || "-",
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
    [],
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
        id: "edit",
        label: "Editar factura",
        icon: <EditRounded fontSize="small" color="info" />,
        onClick: (item) =>
          handleGoTo(`${AppRoutes.Invoices}/${item.id}?mode=edit`),
      },
      {
        id: "print",
        label: "Imprimir factura",
        icon: <PrintRounded fontSize="small" sx={{ color: "text.primary" }} />,
        onClick: (item) => void handlePrintInvoice(item as InvoiceListRow),
        hideOnMobile: true,
      },
    ],
    [handleGoTo, handlePrintInvoice],
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
