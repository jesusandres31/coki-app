import { Entity, IColumn, IDetailColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { invoiceApi } from "src/app/services/invoiceService";
import { formatMoney, formatPaid, formatDate } from "src/utils/format";
import { useUISelector } from "src/slices/ui/uiSlice";
import DeleteDeleteInvoices from "./content/DeleteInvoices";
import CreateOrUpdateDeleteInvoice from "./content/CreateOrUpdateInvoice";
import {
  InvoiceItemView,
  InvoicePaymentView,
  InvoiceView,
} from "src/interfaces";

const COLUMNS: IColumn<InvoiceView>[] = [
  {
    minWidth: 100,
    label: "Cliente",
    id: "client",
    align: "left",
    render: (item) => item.client.name,
  },
  {
    minWidth: 150,
    label: "Cantina",
    id: "canteen",
    render: (item) => item.canteen.name,
  },
  {
    minWidth: 100,
    label: "Total",
    id: "total",
    render: (item) => formatMoney(item.total),
  },
  {
    minWidth: 100,
    label: "Pagado",
    id: "paid",
    render: (item) => formatPaid(item.total, item.paid),
    tooltip: (item) => formatMoney(item.total),
  },
  {
    minWidth: 100,
    label: "Fecha",
    id: "date",
    render: (item) => formatDate(item.date),
  },
];

const DETAIL_COLUMNS: IDetailColumn<
  InvoicePaymentView & InvoiceItemView,
  InvoiceView
>[] = [
  {
    id: "invoice_items",
    title: "Detalles de Venta",
    columns: [
      {
        minWidth: 150,
        label: "Producto",
        id: "product_name",
        render: (item) => item.product_name,
      },
      {
        minWidth: 100,
        label: "Total",
        id: "total",
        render: (item) => formatMoney(item.total),
      },
    ],
  },
  {
    id: "invoice_payments",
    title: "Detalles de Pago",
    columns: [
      {
        minWidth: 150,
        label: "Metodo de Pago",
        id: "payment_method_name",
        render: (item) => item.payment_method_name,
      },
      {
        minWidth: 100,
        label: "Total",
        id: "total",
        render: (item) => formatMoney(item.total),
      },
    ],
  },
];

const DEFAULT_ORDER_BY: keyof InvoiceView = "date";

const ENTITY: Entity = "invoices";

export default function Invoices() {
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getInvoices, { data, isFetching, error }] =
    invoiceApi.useLazyGetInvoicesQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Alquileres" : "Alquier",
  };

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={COLUMNS}
        detailColumns={DETAIL_COLUMNS}
        defaultOrderBy={DEFAULT_ORDER_BY}
        fetchItemsFunc={getInvoices}
        entity={ENTITY}
      />
      <DeleteDeleteInvoices open={MODAL.delete} label={MODAL.label} />
      <CreateOrUpdateDeleteInvoice
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
