import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  AddRounded,
  PrintRounded,
  RestartAltRounded,
  RemoveCircleOutlineRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  useGetInvoicesByDateRangeQuery,
  useGetMeasureUnitsQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { Loading } from "src/components/common";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { VInvoicesResponse } from "src/types/pocketbase-types";
import { formatDate, formatMoney } from "src/utils/format";
import { reportsBreadcrumbFlow } from "./breadcrumbFlow";

type ReportPeriod = "week" | "month" | "custom";

interface DateRange {
  from: string;
  to: string;
}

interface InvoiceProductRow {
  product_id?: string;
  product?: { id?: string; name?: string } | string | null;
  product_name?: string;
  amount?: number;
}

interface DeliveryProductRow {
  key: string;
  productName: string;
  measureUnitName: string;
  amount: number;
}

const stateLabelByName: Record<string, string> = {
  open: "Confirmada",
  draft: "Borrador",
  void: "Cancelada",
};

const parseJsonValue = <T,>(value: unknown): T | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as T;
  return null;
};

const toNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeIsoDate = (value: string) => {
  if (!value) return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return "";
  return parsed.format("YYYY-MM-DD");
};

const resolveDateRange = (from: string, to: string): DateRange | null => {
  const normalizedFrom = normalizeIsoDate(from);
  const normalizedTo = normalizeIsoDate(to);
  if (!normalizedFrom || !normalizedTo) return null;

  return normalizedFrom <= normalizedTo
    ? { from: normalizedFrom, to: normalizedTo }
    : { from: normalizedTo, to: normalizedFrom };
};

const getTodayIso = () => dayjs().format("YYYY-MM-DD");

const getPresetRange = (period: Exclude<ReportPeriod, "custom">): DateRange => {
  const to = dayjs();
  const from = period === "week" ? to.subtract(6, "day") : to.subtract(29, "day");

  return {
    from: from.format("YYYY-MM-DD"),
    to: to.format("YYYY-MM-DD"),
  };
};

const parseInvoiceProducts = (invoice: VInvoicesResponse): InvoiceProductRow[] => {
  const parsed = parseJsonValue<unknown>(invoice.invoice_products);
  if (!parsed) return [];
  return Array.isArray(parsed) ? (parsed as InvoiceProductRow[]) : [];
};

const getInvoiceStateValue = (invoice: VInvoicesResponse) => {
  const stateValue = (invoice as VInvoicesResponse & { state?: unknown }).state;

  if (typeof stateValue === "string") {
    const parsedState = parseJsonValue<{ name?: string }>(stateValue);
    const stateName = parsedState?.name || stateValue;
    return String(stateName || "").toLowerCase();
  }

  if (stateValue && typeof stateValue === "object" && "name" in stateValue) {
    const stateName = (stateValue as { name?: unknown }).name;
    return typeof stateName === "string" ? stateName.toLowerCase() : "";
  }

  return "";
};

const getStateLabel = (invoice: VInvoicesResponse) => {
  const stateName = getInvoiceStateValue(invoice);
  return stateLabelByName[stateName] || stateName || "-";
};

const getInvoiceDateIso = (invoiceDate: string) => normalizeIsoDate(invoiceDate);

const getClientName = (invoice: VInvoicesResponse) => {
  const clientValue = invoice.client;

  if (typeof clientValue === "string") {
    const parsed = parseJsonValue<{ name?: string }>(clientValue);
    return parsed?.name || clientValue || "-";
  }

  if (clientValue && typeof clientValue === "object" && "name" in clientValue) {
    const clientName = (clientValue as { name?: unknown }).name;
    return typeof clientName === "string" ? clientName : "-";
  }

  return "-";
};

const formatPickerDate = (value: Dayjs | null) =>
  value ? value.format("YYYY-MM-DD") : "";

const parsePickerDate = (value: string) => (value ? dayjs(value) : null);

const formatQuantity = (amount: number) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function Reports() {
  const dispatch = useAppDispatch();
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [customFrom, setCustomFrom] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  );
  const [customTo, setCustomTo] = useState(getTodayIso());
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(dayjs());
  const [selectedDays, setSelectedDays] = useState<string[]>([getTodayIso()]);
  const [todayIso] = useState(getTodayIso);

  useEffect(() => {
    dispatch(setBreadcrumbs(reportsBreadcrumbFlow.list()));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const salesDateRange = useMemo(() => {
    if (period === "custom") {
      return resolveDateRange(customFrom, customTo);
    }

    return getPresetRange(period);
  }, [customFrom, customTo, period]);

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

  const sortedSelectedDays = useMemo(
    () => [...selectedDays].sort((a, b) => a.localeCompare(b)),
    [selectedDays],
  );

  const deliveryDateRange = useMemo(() => {
    if (sortedSelectedDays.length === 0) return null;
    return {
      from: sortedSelectedDays[0],
      to: sortedSelectedDays[sortedSelectedDays.length - 1],
    };
  }, [sortedSelectedDays]);

  const deliveryQueryArgs = useMemo(
    () => deliveryDateRange || { from: todayIso, to: todayIso },
    [deliveryDateRange, todayIso],
  );

  const {
    data: deliveryInvoicesRaw = [],
    error: deliveryError,
    isFetching: isFetchingDelivery,
  } = useGetInvoicesByDateRangeQuery(deliveryQueryArgs, {
    skip: !deliveryDateRange,
  });

  const { data: products = [] } = useGetProductsQuery();
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery();

  const measureUnitNameById = useMemo(
    () => new Map(measureUnits.map((unit) => [unit.id, String(unit.name || "-")])),
    [measureUnits],
  );

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const openSalesInvoices = useMemo(
    () => salesInvoicesRaw.filter((invoice) => getInvoiceStateValue(invoice) === "open"),
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

  const selectedDaysSet = useMemo(
    () => new Set(sortedSelectedDays),
    [sortedSelectedDays],
  );

  const deliveryInvoices = useMemo(
    () =>
      deliveryInvoicesRaw.filter((invoice) => {
        if (getInvoiceStateValue(invoice) !== "open") return false;
        const invoiceDate = getInvoiceDateIso(invoice.date);
        if (!invoiceDate) return false;
        return selectedDaysSet.has(invoiceDate);
      }),
    [deliveryInvoicesRaw, selectedDaysSet],
  );

  const deliveryProducts = useMemo<DeliveryProductRow[]>(() => {
    const map = new Map<string, DeliveryProductRow>();

    deliveryInvoices.forEach((invoice) => {
      parseInvoiceProducts(invoice).forEach((row) => {
        const amount = Math.max(0, toNumber(row.amount));
        if (amount <= 0) return;

        const productFromRowObject =
          row.product && typeof row.product === "object" ? row.product : null;
        const productId = String(
          row.product_id ||
            (typeof row.product === "string" ? row.product : productFromRowObject?.id || ""),
        ).trim();
        const productByIdEntry = productId ? productById.get(productId) : null;
        const productName =
          String(
            row.product_name ||
              productFromRowObject?.name ||
              productByIdEntry?.name ||
              "Producto sin nombre",
          ).trim() || "Producto sin nombre";

        const measureUnitName =
          measureUnitNameById.get(String(productByIdEntry?.measure_unit || "")) || "-";
        const key = `${productId || productName.toLowerCase()}::${measureUnitName}`;

        const current = map.get(key);
        if (current) {
          current.amount += amount;
          return;
        }

        map.set(key, {
          key,
          productName,
          measureUnitName,
          amount,
        });
      });
    });

    return [...map.values()].sort((a, b) => a.productName.localeCompare(b.productName));
  }, [deliveryInvoices, measureUnitNameById, productById]);

  const totalProductsToDeliver = useMemo(
    () => deliveryProducts.reduce((acc, item) => acc + item.amount, 0),
    [deliveryProducts],
  );

  const handleAddDay = () => {
    const value = formatPickerDate(selectedDay);
    const normalized = normalizeIsoDate(value);

    if (!normalized) {
      dispatch(
        setSnackbar({
          message: "Seleccioná una fecha válida para agregarla a la lista.",
          type: "error",
        }),
      );
      return;
    }

    setSelectedDays((prev) => {
      if (prev.includes(normalized)) return prev;
      return [...prev, normalized];
    });
  };

  const handleRemoveDay = (day: string) => {
    setSelectedDays((prev) => prev.filter((item) => item !== day));
  };

  const handleResetDays = () => {
    setSelectedDays([]);
  };

  const handlePrintDeliveryList = () => {
    if (deliveryProducts.length === 0) {
      dispatch(
        setSnackbar({
          message: "No hay productos para imprimir en la lista de reparto.",
          type: "error",
        }),
      );
      return;
    }

    const popup = window.open("", "_blank", "noopener,noreferrer");

    if (!popup) {
      dispatch(
        setSnackbar({
          message:
            "No se pudo abrir la vista de impresión. Verificá el bloqueo de popups.",
          type: "error",
        }),
      );
      return;
    }

    const selectedDaysText = sortedSelectedDays
      .map((date) => formatDate(date))
      .join(", ");
    const createdAt = dayjs().format("DD/MM/YYYY HH:mm");
    const rowsHtml = deliveryProducts
      .map(
        (row) =>
          `<tr>
            <td>${escapeHtml(row.productName)}</td>
            <td>${escapeHtml(row.measureUnitName)}</td>
            <td style="text-align:right">${escapeHtml(formatQuantity(row.amount))}</td>
          </tr>`,
      )
      .join("");

    popup.document.write(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Lista de reparto</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        padding: 24px;
        color: #111827;
      }
      h1 {
        margin: 0 0 8px 0;
        font-size: 24px;
      }
      p {
        margin: 2px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 8px 10px;
        font-size: 13px;
      }
      th {
        text-align: left;
        background: #f3f4f6;
      }
      tfoot td {
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <h1>Lista de reparto</h1>
    <p><strong>Días:</strong> ${escapeHtml(selectedDaysText || "-")}</p>
    <p><strong>Generado:</strong> ${escapeHtml(createdAt)}</p>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Unidad</th>
          <th style="text-align:right">Cantidad</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">Total</td>
          <td style="text-align:right">${escapeHtml(
            formatQuantity(totalProductsToDeliver),
          )}</td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <PageContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container
          component="main"
          maxWidth="xl"
          sx={{
            py: { xs: 2, md: 3 },
            px: { xs: 1, sm: 2 },
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
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
                      value={parsePickerDate(customFrom)}
                      onChange={(value) => setCustomFrom(formatPickerDate(value))}
                      format="DD/MM/YYYY"
                      slotProps={{
                        field: { readOnly: true },
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                    <DatePicker
                      label="Hasta"
                      value={parsePickerDate(customTo)}
                      onChange={(value) => setCustomTo(formatPickerDate(value))}
                      format="DD/MM/YYYY"
                      slotProps={{
                        field: { readOnly: true },
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
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
                  <Box
                    sx={{
                      minHeight: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Loading />
                  </Box>
                ) : (
                  <Stack spacing={2}>
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
                      }}
                    >
                      <Table size="small" stickyHeader>
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
                                        (acc, item) => acc + Math.max(0, toNumber(item.amount)),
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
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={1}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Lista de reparto por días
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PrintRounded />}
                    onClick={handlePrintDeliveryList}
                    disabled={deliveryProducts.length === 0}
                  >
                    Imprimir lista
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <DatePicker
                    label="Día"
                    value={selectedDay}
                    onChange={setSelectedDay}
                    format="DD/MM/YYYY"
                    slotProps={{
                      field: { readOnly: true },
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddRounded />}
                    onClick={handleAddDay}
                  >
                    Agregar día
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<RestartAltRounded />}
                    onClick={handleResetDays}
                    disabled={selectedDays.length === 0}
                  >
                    Limpiar
                  </Button>
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {sortedSelectedDays.length > 0 ? (
                    sortedSelectedDays.map((day) => (
                      <Chip
                        key={day}
                        label={formatDate(day)}
                        onDelete={() => handleRemoveDay(day)}
                        deleteIcon={<RemoveCircleOutlineRounded />}
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay días seleccionados. Agregá al menos uno para generar la
                      lista.
                    </Typography>
                  )}
                </Stack>

                {deliveryError && (
                  <Alert severity="error">
                    No se pudo cargar la lista de productos vendidos para los días
                    seleccionados.
                  </Alert>
                )}

                {isFetchingDelivery ? (
                  <Box
                    sx={{
                      minHeight: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Loading />
                  </Box>
                ) : (
                  <TableContainer
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell>Unidad</TableCell>
                          <TableCell align="right">Cantidad a repartir</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deliveryProducts.length > 0 ? (
                          deliveryProducts.map((row) => (
                            <TableRow key={row.key}>
                              <TableCell>{row.productName}</TableCell>
                              <TableCell>{row.measureUnitName}</TableCell>
                              <TableCell align="right">
                                {formatQuantity(row.amount)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              No hay productos vendidos para los días seleccionados.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Typography variant="body2" color="text.secondary">
                  Total de unidades a repartir:{" "}
                  <Box component="span" fontWeight={700} color="text.primary">
                    {formatQuantity(totalProductsToDeliver)}
                  </Box>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </LocalizationProvider>
    </PageContainer>
  );
}

