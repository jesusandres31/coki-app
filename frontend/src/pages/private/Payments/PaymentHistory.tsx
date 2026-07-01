import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "react-router-dom";
import { AddCardRounded, EditNoteRounded } from "@mui/icons-material";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { COLOR, getListArgsInitialState } from "src/constants";
import {
  PaymentAccountMovementTypeName,
  PaymentAccountMovementWithExpand,
  useGetClientByIdQuery,
  useGetPaymentAccountMovementsByClientQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { resetBreadcrumbs, setBreadcrumbs } from "src/slices/uiSlice";
import { Column, GetList } from "src/types";
import { useUI } from "src/hooks";
import { formatDate, formatMoney, MoneyValue } from "src/utils/format";
import { paymentsBreadcrumbFlow } from "./breadcrumbFlow";
import PaymentMovementDialog from "./PaymentMovementDialog";

const paymentTypeLabels: Record<PaymentAccountMovementTypeName, string> = {
  payment: "Entrega",
  debt: "Deuda",
  adjustment: "Rectificación",
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

export default function PaymentHistory() {
  const dispatch = useAppDispatch();
  const { isMobile } = useUI();
  const { clientId } = useParams();
  const [movementDialogMode, setMovementDialogMode] = useState<
    "movement" | "rectification" | null
  >(null);
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    perPage: 10,
    order: "desc",
    orderBy: "created",
  }));

  const { data: client } = useGetClientByIdQuery(clientId || skipToken);
  const { data, error, isFetching } =
    useGetPaymentAccountMovementsByClientQuery(
      clientId ? { ...queryArgs, clientId } : skipToken,
    );

  useEffect(() => {
    dispatch(setBreadcrumbs(paymentsBreadcrumbFlow.detail(client?.name)));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [client?.name, dispatch]);

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
        id: "description",
        label: "Descripción",
        align: "left",
        minWidth: 280,
        disableSort: true,
        render: (item: PaymentAccountMovementWithExpand) =>
          item.description || "-",
      },
      {
        id: "balance_before",
        label: "Saldo anterior",
        align: "right",
        minWidth: 150,
        type: "number",
        render: (item: PaymentAccountMovementWithExpand) => (
          <MoneyValue value={item.balance_before} />
        ),
      },
      {
        id: "delta",
        label: "Movimiento",
        align: "right",
        minWidth: 140,
        type: "number",
        render: (item: PaymentAccountMovementWithExpand) => (
          <MoneyValue value={item.delta} />
        ),
      },
      {
        id: "balance_after",
        label: "Saldo resultante",
        align: "right",
        minWidth: 150,
        type: "number",
        render: (item: PaymentAccountMovementWithExpand) => (
          <MoneyValue value={item.balance_after} />
        ),
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
        toolbarInfoElement={
          <Box
            sx={{
              borderLeft: "3px solid",
              borderColor: COLOR.whatsapp_green,
              pl: 1.25,
              height: 40,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "center",
              columnGap: 1,
              whiteSpace: "nowrap",
            }}
          >
            <Typography
              variant={isMobile ? "caption" : "body2"}
              color="text.secondary"
              sx={{ lineHeight: 1 }}
            >
              Saldo actual
            </Typography>
            <Typography
              variant={isMobile ? "subtitle2" : "h6"}
              sx={{
                color: COLOR.whatsapp_green,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {formatMoney(client?.balance ?? 0)}
            </Typography>
          </Box>
        }
        toolbarElement={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              size="small"
              color="info"
              variant="outlined"
              startIcon={<EditNoteRounded />}
              onClick={() => setMovementDialogMode("rectification")}
              disabled={!client}
            >
              Rectificar
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddCardRounded />}
              onClick={() => setMovementDialogMode("movement")}
              disabled={!client}
            >
              Registrar movimiento
            </Button>
          </Stack>
        }
      />
      <PaymentMovementDialog
        open={Boolean(movementDialogMode)}
        client={client ?? null}
        mode={movementDialogMode ?? "movement"}
        onClose={() => setMovementDialogMode(null)}
      />
    </>
  );
}
