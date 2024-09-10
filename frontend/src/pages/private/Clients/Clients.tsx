import { Client } from "src/interfaces";
import { IColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { clientApi } from "src/app/services/clientService";
import { useUISelector } from "src/slices/ui/uiSlice";
import CreateOrUpdateClient from "./content/CreateOrUpdateClient";
import DeleteClients from "./content/DeleteClients";
import { formatDate } from "src/utils/format";
import { Collections } from "src/interfaces/pocketbase-types";

const COLUMNS: IColumn<Client>[] = [
  {
    minWidth: 150,
    label: "Nombre",
    id: "name",
    align: "left",
  },
  {
    minWidth: 100,
    label: "Tel.",
    id: "phone",
  },
  {
    minWidth: 100,
    label: "Dirección",
    id: "address",
  },
  {
    minWidth: 100,
    label: "Fecha Creación",
    id: "created",
    render: (item) => formatDate(item.created),
  },
];

const DEFAULT_ORDER_BY: keyof Client = "created";

const ENTITY = Collections.Clients;

export default function Clients() {
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getClients, { data, isFetching, error }] =
    clientApi.useLazyGetClientsQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Clientes" : "Cliente",
  };

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={COLUMNS}
        defaultOrderBy={DEFAULT_ORDER_BY}
        fetchItemsFunc={getClients}
        entity={ENTITY}
      />
      <DeleteClients open={MODAL.delete} label={MODAL.label} />
      <CreateOrUpdateClient
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
