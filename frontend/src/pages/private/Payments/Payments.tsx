import { useEffect, useMemo, useState } from "react";
import { AddCardRounded, ReceiptLongRounded } from "@mui/icons-material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import { useGetClientsListQuery } from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { useRouter } from "src/hooks";
import { AppRoutes } from "src/config";
import { ClientsResponse } from "src/types/pocketbase-types";
import { Column, DataGridRowAction, GetList } from "src/types";
import { MoneyValue } from "src/utils/format";
import { paymentsBreadcrumbFlow } from "./breadcrumbFlow";
import PaymentMovementDialog from "./PaymentMovementDialog";

export default function Payments() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const [clientForPaymentMovement, setClientForPaymentMovement] =
    useState<ClientsResponse | null>(null);
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(paymentsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } = useGetClientsListQuery(queryArgs);

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Cliente",
        align: "left",
        minWidth: 260,
      },
      {
        id: "balance",
        label: "Saldo",
        align: "right",
        minWidth: 160,
        type: "number",
        render: (item: ClientsResponse) => (
          <MoneyValue value={item.balance ?? 0} />
        ),
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
        id: "payment-history",
        label: "Ver historial",
        icon: <ReceiptLongRounded fontSize="small" color="info" />,
        onClick: (item) => handleGoTo(`${AppRoutes.Payments}/${item.id}`),
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
      />
      <PaymentMovementDialog
        open={Boolean(clientForPaymentMovement)}
        client={clientForPaymentMovement}
        onClose={() => setClientForPaymentMovement(null)}
      />
    </>
  );
}
