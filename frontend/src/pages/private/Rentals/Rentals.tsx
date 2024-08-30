import { RentalView, RentalPaymentView } from "src/interfaces";
import { Entity, IColumn, IDetailColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { rentalApi } from "src/app/services/rentalService";
import {
  formatDate,
  formatMoney,
  formatPaid,
  formatTime,
} from "src/utils/format";
import { useUISelector } from "src/slices/ui/uiSlice";
import DeleteRentals from "./content/DeleteRentals";
import CreateOrUpdateRental from "./content/CreateOrUpdateRental";

const COLUMNS: IColumn<RentalView>[] = [
  {
    minWidth: 100,
    label: "Cliente",
    id: "client",
    align: "left",
    render: (item) => item.client.name,
  },
  {
    minWidth: 150,
    label: "Cancha",
    id: "field",
    render: (item) => item.field.name,
  },
  {
    minWidth: 100,
    label: "Pelota",
    id: "ball",
    render: (item) => item.ball.name,
  },
  {
    minWidth: 100,
    label: "Cant. horas",
    id: "hours",
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
    label: "Hora Inicio",
    id: "started_at",
    render: (item) => formatTime(item.started_at),
  },
  {
    minWidth: 100,
    label: "Día",
    id: "started_at",
    render: (item) => formatDate(item.started_at),
  },
];

const DETAIL_COLUMNS: IDetailColumn<RentalPaymentView, RentalView>[] = [
  {
    id: "rental_payments",
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

const DEFAULT_ORDER_BY: keyof RentalView = "started_at";

const ENTITY: Entity = "rentals";

export default function Rentals() {
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getRentals, { data, isFetching, error }] =
    rentalApi.useLazyGetRentalsQuery();

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
        fetchItemsFunc={getRentals}
        entity={ENTITY}
      />
      <DeleteRentals open={MODAL.delete} label={MODAL.label} />
      <CreateOrUpdateRental
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
