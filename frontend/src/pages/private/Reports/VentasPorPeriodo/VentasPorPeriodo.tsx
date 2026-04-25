import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { CheckRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useGetInvoicesByDateRangeQuery } from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { TableLoadingSkeleton } from "src/components/common";
import { setSnackbar } from "src/slices/uiSlice";
import { formatDate, formatMoney } from "src/utils/format";
import {
  ReportPeriod,
  formatPickerDate,
  formatQuantity,
  getClientName,
  getPresetRange,
  getStateLabel,
  getTodayIso,
  getInvoiceStateValue,
  parseInvoiceProducts,
  parsePickerDate,
  resolveDateRange,
  toNumber,
} from "../reportUtils";

export default function VentasPorPeriodo() {
  const dispatch = useAppDispatch();
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [customFromDraft, setCustomFromDraft] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  );
  const [customToDraft, setCustomToDraft] = useState(getTodayIso());
  const [customFrom, setCustomFrom] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  );
  const [customTo, setCustomTo] = useState(getTodayIso());
  const [todayIso] = useState(getTodayIso);

  const salesDateRange = useMemo(() => {
    if (period === "custom") {
      return resolveDateRange(customFrom, customTo);
    }

    return getPresetRange(period);
  }, [customFrom, customTo, period]);

  const handleApplyCustomDateRange = () => {
    const resolved = resolveDateRange(customFromDraft, customToDraft);

    if (!resolved) {
      dispatch(
        setSnackbar({
          message: "Seleccioná un rango de fechas válido para buscar ventas.",
          type: "error",
        }),
      );
      return;
    }

    setCustomFrom(resolved.from);
    setCustomTo(resolved.to);
    setCustomFromDraft(resolved.from);
    setCustomToDraft(resolved.to);
  };

  const salesQueryArgs = useMemo(
    () => salesDateRange || { from: todayIso, to: todayIso },
    [salesDateRange, todayIso],
  );

  const {
    data: salesInvoicesRaw = [],
    error: salesError,
    isFetching: isFetchingSales,
  } = useGetInvoicesByDateRangeQuery(salesQueryArgs, {
    skip: !salesDateRange,
  });

  const openSalesInvoices = useMemo(
    () =>
      salesInvoicesRaw.filter(
        (invoice) => getInvoiceStateValue(invoice) === "open",
      ),
    [salesInvoicesRaw],
  );

  const salesSummary = useMemo(() => {
    let total = 0;
    let soldUnits = 0;

    openSalesInvoices.forEach((invoice) => {
      total += toNumber(invoice.total);
      parseInvoiceProducts(invoice).forEach((item) => {
        soldUnits += Math.max(0, toNumber(item.amount));
      });
    });

    const invoices = openSalesInvoices.length;

    return {
      total,
      invoices,
      soldUnits,
      averageTicket: invoices > 0 ? total / invoices : 0,
    };
  }, [openSalesInvoices]);

  return (
    <Box
      component="section"
      sx={{
        px: 2,
        py: 1,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: { xs: "visible", sm: "auto" },
        overflowX: "hidden",
        "@media (max-height: 900px)": {
          overflowY: "auto",
        },
      }}
    >
      <Stack
        spacing={2}
        sx={{ height: { xs: "auto", sm: "100%" }, minHeight: 0 }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1}
        >
          <Typography variant="h6" fontWeight={600}>
            Ventas por período
          </Typography>
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={period}
            onChange={(_event, value: ReportPeriod | null) => {
              if (value) setPeriod(value);
            }}
          >
            <ToggleButton value="week">Última semana</ToggleButton>
            <ToggleButton value="month">Último mes</ToggleButton>
            <ToggleButton value="custom">Rango custom</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {period === "custom" && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <DatePicker
              label="Desde"
              value={parsePickerDate(customFromDraft)}
              onChange={(value) => setCustomFromDraft(formatPickerDate(value))}
              format="DD/MM/YYYY"
              slotProps={{
                field: { readOnly: true },
                textField: { size: "small", fullWidth: true },
              }}
            />
            <DatePicker
              label="Hasta"
              value={parsePickerDate(customToDraft)}
              onChange={(value) => setCustomToDraft(formatPickerDate(value))}
              format="DD/MM/YYYY"
              slotProps={{
                field: { readOnly: true },
                textField: { size: "small", fullWidth: true },
              }}
            />
            <Box
              sx={{
                display: "flex",
                pb: 0.3,
              }}
            >
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckRounded />}
                onClick={handleApplyCustomDateRange}
                disabled={isFetchingSales}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  alignSelf: { xs: "stretch", sm: "flex-end" },
                }}
              >
                Confirmar
              </Button>
            </Box>
          </Stack>
        )}

        {!salesDateRange && period === "custom" && (
          <Alert severity="warning">
            Seleccioná un rango de fechas válido para calcular las ventas.
          </Alert>
        )}

        {salesDateRange && (
          <Typography variant="body2" color="text.secondary">
            Período: {formatDate(salesDateRange.from)} -{" "}
            {formatDate(salesDateRange.to)} (solo facturas confirmadas)
          </Typography>
        )}

        {salesError && (
          <Alert severity="error">
            No se pudieron cargar las ventas para el período seleccionado.
          </Alert>
        )}

        {isFetchingSales ? (
          <TableLoadingSkeleton columns={5} rows={7} />
        ) : (
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total vendido
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatMoney(salesSummary.total)}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Facturas confirmadas
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {salesSummary.invoices}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Unidades vendidas
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatQuantity(salesSummary.soldUnits)}
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ticket promedio
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatMoney(salesSummary.averageTicket)}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>

            <Divider />

            <TableContainer
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                flex: 1,
                minHeight: { xs: 220, sm: 240, md: 280 },
                maxHeight: { xs: 340, md: "none" },
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <Table size="small" stickyHeader sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Productos</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openSalesInvoices.length > 0 ? (
                    openSalesInvoices.map((invoice) => {
                      const invoiceProducts = parseInvoiceProducts(invoice);

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{getClientName(invoice)}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={getStateLabel(invoice)}
                              color="success"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatQuantity(
                              invoiceProducts.reduce(
                                (acc, item) =>
                                  acc + Math.max(0, toNumber(item.amount)),
                                0,
                              ),
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {formatMoney(toNumber(invoice.total))}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay ventas confirmadas en el período elegido.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
