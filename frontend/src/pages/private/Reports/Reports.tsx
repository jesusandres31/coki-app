import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  AddRounded,
  CheckRounded,
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
import { useLocation } from "react-router-dom";
import {
  useGetInvoicesByDateRangeQuery,
  useGetMeasureUnitsQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { TableLoadingSkeleton } from "src/components/common";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { AppRoutes } from "src/config";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { VInvoicesResponse } from "src/types/pocketbase-types";
import { formatDate, formatMoney } from "src/utils/format";
import { reportsBreadcrumbFlow } from "./breadcrumbFlow";
import { openDeliveryPdfInViewer, openDeliveryPdfTab } from "./pdf";

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
  const from =
    period === "week" ? to.subtract(6, "day") : to.subtract(29, "day");

  return {
    from: from.format("YYYY-MM-DD"),
    to: to.format("YYYY-MM-DD"),
  };
};

const parseInvoiceProducts = (
  invoice: VInvoicesResponse,
): InvoiceProductRow[] => {
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

const getInvoiceDateIso = (invoiceDate: string) => {
  if (!invoiceDate) return "";
  const raw = String(invoiceDate).trim();
  const leadingDateMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (leadingDateMatch) return leadingDateMatch[0];
  return normalizeIsoDate(raw);
};

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

export default function Reports() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const isDistributionRoute = pathname.startsWith(
    AppRoutes.ReportsDistribution,
  );
  const isSalesRoute = pathname.startsWith(AppRoutes.ReportsSales);
  const showDistribution =
    isDistributionRoute || (!isDistributionRoute && !isSalesRoute);
  const showSales = isSalesRoute || (!isDistributionRoute && !isSalesRoute);
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [customFromDraft, setCustomFromDraft] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  );
  const [customToDraft, setCustomToDraft] = useState(getTodayIso());
  const [customFrom, setCustomFrom] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  );
  const [customTo, setCustomTo] = useState(getTodayIso());
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(dayjs());
  const [selectedDays, setSelectedDays] = useState<string[]>([getTodayIso()]);
  const [todayIso] = useState(getTodayIso);
  const [isPrintingDelivery, setIsPrintingDelivery] = useState(false);

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
    skip: !salesDateRange || !showSales,
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
    skip: !deliveryDateRange || !showDistribution,
  });

  const { data: products = [] } = useGetProductsQuery(undefined, {
    skip: !showDistribution,
  });
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery(undefined, {
    skip: !showDistribution,
  });

  const measureUnitNameById = useMemo(
    () =>
      new Map(measureUnits.map((unit) => [unit.id, String(unit.name || "-")])),
    [measureUnits],
  );

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );
  const productByNormalizedName = useMemo(
    () =>
      new Map(
        products.map((p) => [
          String(p.name || "")
            .trim()
            .toLowerCase(),
          p,
        ]),
      ),
    [products],
  );

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
        const productIdFromRow = String(
          row.product_id ||
            (typeof row.product === "string"
              ? row.product
              : productFromRowObject?.id || ""),
        ).trim();
        const fallbackProductName =
          String(row.product_name || productFromRowObject?.name || "").trim() ||
          "Producto sin nombre";
        const normalizedFallbackName = fallbackProductName.toLowerCase();
        const canonicalProduct =
          (productIdFromRow ? productById.get(productIdFromRow) : null) ||
          productByNormalizedName.get(normalizedFallbackName) ||
          null;
        const canonicalProductId = String(
          canonicalProduct?.id || productIdFromRow || "",
        ).trim();
        const productName = String(
          canonicalProduct?.name || fallbackProductName,
        ).trim();

        const measureUnitName =
          measureUnitNameById.get(
            String(canonicalProduct?.measure_unit || ""),
          ) || "-";
        const key = canonicalProductId
          ? `id::${canonicalProductId}`
          : `name::${productName.toLowerCase()}`;

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

    return [...map.values()].sort((a, b) =>
      a.productName.localeCompare(b.productName),
    );
  }, [
    deliveryInvoices,
    measureUnitNameById,
    productById,
    productByNormalizedName,
  ]);

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

  const handlePrintDeliveryList = async () => {
    if (deliveryProducts.length === 0) {
      dispatch(
        setSnackbar({
          message: "No hay productos para imprimir en la lista de reparto.",
          type: "error",
        }),
      );
      return;
    }

    const popup = openDeliveryPdfTab();

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

    setIsPrintingDelivery(true);

    try {
      await openDeliveryPdfInViewer(
        {
          selectedDaysText:
            sortedSelectedDays.map((date) => formatDate(date)).join(", ") ||
            "-",
          generatedAt: dayjs().format("DD/MM/YYYY HH:mm"),
          items: deliveryProducts.map((row, index) => ({
            id: `${row.key}-${index}`,
            productName: row.productName,
            measureUnitName: row.measureUnitName,
            amount: formatQuantity(row.amount),
          })),
          totalAmount: formatQuantity(totalProductsToDeliver),
        },
        popup,
      );
    } catch {
      popup.close();
      dispatch(
        setSnackbar({
          message: "No se pudo generar o abrir el PDF en la pestaña nueva.",
          type: "error",
        }),
      );
    } finally {
      setIsPrintingDelivery(false);
    }
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
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          }}
        >
          {showSales && (
            <Box
              component="section"
              sx={{
                order: 2,
                p: { xs: 2, md: 3 },
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
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
                      onChange={(value) =>
                        setCustomFromDraft(formatPickerDate(value))
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        field: { readOnly: true },
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                    <DatePicker
                      label="Hasta"
                      value={parsePickerDate(customToDraft)}
                      onChange={(value) =>
                        setCustomToDraft(formatPickerDate(value))
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        field: { readOnly: true },
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
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
                  </Stack>
                )}

                {!salesDateRange && period === "custom" && (
                  <Alert severity="warning">
                    Seleccioná un rango de fechas válido para calcular las
                    ventas.
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
                    No se pudieron cargar las ventas para el período
                    seleccionado.
                  </Alert>
                )}

                {isFetchingSales ? (
                  <TableLoadingSkeleton columns={5} rows={7} />
                ) : (
                  <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.5}
                    >
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
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "auto",
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
                              const invoiceProducts =
                                parseInvoiceProducts(invoice);

                              return (
                                <TableRow key={invoice.id}>
                                  <TableCell>
                                    {formatDate(invoice.date)}
                                  </TableCell>
                                  <TableCell>
                                    {getClientName(invoice)}
                                  </TableCell>
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
                                          acc +
                                          Math.max(0, toNumber(item.amount)),
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
          )}

          {showDistribution && (
            <Box
              component="section"
              sx={{
                order: 1,
                p: { xs: 2, md: 3 },
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
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
                    onClick={() => void handlePrintDeliveryList()}
                    loading={isPrintingDelivery}
                    loadingPosition="start"
                    disabled={
                      deliveryProducts.length === 0 || isPrintingDelivery
                    }
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
                    sx={{ minWidth: 132, whiteSpace: "nowrap" }}
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
                      No hay días seleccionados. Agregá al menos uno para
                      generar la lista.
                    </Typography>
                  )}
                </Stack>

                {deliveryError && (
                  <Alert severity="error">
                    No se pudo cargar la lista de productos vendidos para los
                    días seleccionados.
                  </Alert>
                )}

                {isFetchingDelivery ? (
                  <TableLoadingSkeleton columns={3} rows={7} />
                ) : (
                  <TableContainer
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      overflowX: "auto",
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell>Unidad</TableCell>
                          <TableCell align="right">
                            Cantidad a repartir
                          </TableCell>
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
                              No hay productos vendidos para los días
                              seleccionados.
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
            </Box>
          )}
        </Container>
      </LocalizationProvider>
    </PageContainer>
  );
}
