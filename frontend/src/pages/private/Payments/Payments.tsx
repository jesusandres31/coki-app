import { useEffect, useMemo, useState } from "react";
import { AddCardRounded } from "@mui/icons-material";
import { Button, Chip } from "@mui/material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { getListArgsInitialState } from "src/constants";
import {
  PaymentAccountMovementTypeName,
  PaymentAccountMovementWithExpand,
  useGetPaymentAccountMovementsListQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { Column, GetList } from "src/types";
import { formatDate, formatMoney } from "src/utils/format";
import { paymentsBreadcrumbFlow } from "./breadcrumbFlow";
import PaymentMovementDialog from "./PaymentMovementDialog";

const paymentTypeLabels: Record<PaymentAccountMovementTypeName, string> = {
  payment: "Pago",
  debt: "Deuda",
  adjustment: "Ajuste",
};

const paymentTypeColors: Record<
  PaymentAccountMovementTypeName,
  "success" | "warning" | "info"
> = {
  payment: "success",
  debt: "warning",
  adjustment: "info",
};

const isKnownPaymentType = (
  value: string,
): value is PaymentAccountMovementTypeName =>
  ["payment", "debt", "adjustment"].includes(value);

const getMovementTypeName = (item: PaymentAccountMovementWithExpand) =>
  String(item.expand?.type?.name || "");

export default function Payments() {
  const dispatch = useAppDispatch();
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "desc",
    orderBy: "created",
  }));

  useEffect(() => {
    dispatch(setBreadcrumbs(paymentsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data, error, isFetching } =
    useGetPaymentAccountMovementsListQuery(queryArgs);

  const columns: Column = useMemo(
    () => [
      {
        id: "created",
        label: "Fecha",
        align: "left",
        minWidth: 140,
        render: (item: PaymentAccountMovementWithExpand) =>
          formatDate(item.created),
      },
      {
        id: "client",
        label: "Cliente",
        align: "left",
        minWidth: 240,
        disableSort: true,
        render: (item: PaymentAccountMovementWithExpand) =>
          item.expand?.client?.name || "-",
      },
      {
        id: "description",
        label: "Descripción",
        align: "left",
        minWidth: 280,
        render: (item: PaymentAccountMovementWithExpand) =>
          item.description || "-",
      },
      {
        id: "type",
        label: "Tipo",
        align: "left",
        minWidth: 140,
        disableSort: true,
        render: (item: PaymentAccountMovementWithExpand) => {
          const typeName = getMovementTypeName(item);
          const label = isKnownPaymentType(typeName)
            ? paymentTypeLabels[typeName]
            : typeName || "-";

          return isKnownPaymentType(typeName) ? (
            <Chip
              size="small"
              variant="outlined"
              color={paymentTypeColors[typeName]}
              label={label}
            />
          ) : (
            label
          );
        },
      },
      {
        id: "amount",
        label: "Importe",
        align: "right",
        minWidth: 140,
        type: "number",
        render: (item: PaymentAccountMovementWithExpand) =>
          formatMoney(item.amount ?? 0),
      },
    ],
    [],
  );

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={columns}
        hasSearch
        searchPlaceholder="Buscar movimiento"
        initialQuery={queryArgs}
        onQueryChange={setQueryArgs}
        toolbarElement={
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCardRounded />}
            onClick={() => setMovementDialogOpen(true)}
          >
            Nuevo movimiento
          </Button>
        }
      />
      <PaymentMovementDialog
        open={movementDialogOpen}
        client={null}
        allowClientSelect
        onClose={() => setMovementDialogOpen(false)}
      />
    </>
  );
}
