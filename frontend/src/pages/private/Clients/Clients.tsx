import { useEffect, useMemo, useState } from "react";
import {
  AddRounded,
  AddCardRounded,
  DeleteRounded,
  EditRounded,
  OpenInNewRounded,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import {
  useDeleteClientMutation,
  useGetClientsListQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { ClientsResponse } from "src/types/pocketbase-types";
import { Column, DataGridRowAction, GetList } from "src/types";
import { formatMoney } from "src/utils/format";
import { clientsBreadcrumbFlow } from "./breadcrumbFlow";
import PaymentMovementDialog from "../Payments/PaymentMovementDialog";

export default function Clients() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [clientToDelete, setClientToDelete] = useState<ClientsResponse | null>(
    null,
  );
  const [clientForPaymentMovement, setClientForPaymentMovement] =
    useState<ClientsResponse | null>(null);
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(clientsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetClientsListQuery(queryArgs);
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(clientToDelete.id).unwrap();
      dispatch(
        setSnackbar({
          message: "Cliente eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setClientToDelete(null);
    } catch {
      dispatch(
        setSnackbar({
          message: "No se pudo eliminar el cliente.",
          type: "error",
        }),
      );
    }
  };

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Nombre",
        align: "left",
        minWidth: 220,
      },
      {
        id: "address",
        label: "Dirección",
        align: "left",
        minWidth: 260,
      },
      {
        id: "phone",
        label: "Teléfono",
        align: "left",
        minWidth: 180,
      },
      {
        id: "balance",
        label: "Saldo",
        align: "right",
        minWidth: 140,
        type: "number",
        render: (item: ClientsResponse) => formatMoney(item.balance ?? 0),
      },
    ],
    [],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "add-payment-account-movement",
        label: "Registrar movimiento",
        icon: <AddCardRounded fontSize="small" color="primary" />,
        onClick: (item) => setClientForPaymentMovement(item as ClientsResponse),
      },
      {
        id: "open",
        label: "Abrir cliente",
        icon: <OpenInNewRounded fontSize="small" color="primary" />,
        onClick: (item) => handleGoTo(`${AppRoutes.Clients}/${item.id}`),
      },
      {
        id: "edit",
        label: "Editar cliente",
        icon: <EditRounded fontSize="small" color="info" />,
        onClick: (item) =>
          handleGoTo(`${AppRoutes.Clients}/${item.id}?mode=edit`),
      },
      {
        id: "delete",
        label: "Eliminar cliente",
        icon: <DeleteRounded fontSize="small" color="error" />,
        onClick: (item) => setClientToDelete(item as ClientsResponse),
      },
    ],
    [handleGoTo],
  );

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={columns}
        hasSearch
        searchPlaceholder="Buscar cliente"
        initialQuery={queryArgs}
        onQueryChange={setQueryArgs}
        rowActions={rowActions}
        toolbarElement={
          <Button
            size="small"
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => handleGoTo(AppRoutes.ClientsNew)}
          >
            Crear cliente
          </Button>
        }
      />
      <PaymentMovementDialog
        open={Boolean(clientForPaymentMovement)}
        client={clientForPaymentMovement}
        onClose={() => setClientForPaymentMovement(null)}
      />
      <Dialog
        open={Boolean(clientToDelete)}
        onClose={isDeleting ? undefined : () => setClientToDelete(null)}
      >
        <DialogTitle>Eliminar cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar este cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="inherit"
            sx={{ color: "text.secondary" }}
            onClick={() => setClientToDelete(null)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
