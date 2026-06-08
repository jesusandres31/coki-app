import { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  AddRounded,
  PrintRounded,
  RemoveCircleOutlineRounded,
  RestartAltRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  useGetInvoicesByDateRangeQuery,
  useGetMeasureUnitsQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { TableLoadingSkeleton } from "src/components/common";
import { setSnackbar } from "src/slices/uiSlice";
import { formatDate } from "src/utils/format";
import { buildMeasureUnitNameById } from "src/utils/measureUnits";
import {
  formatPickerDate,
  formatQuantity,
  getInvoiceDateIso,
  getInvoiceStateValue,
  getTodayIso,
  normalizeIsoDate,
  parseInvoiceProducts,
  toNumber,
} from "../reportUtils";
import { openDeliveryPdfInViewer, openDeliveryPdfTab } from "../pdf";

interface DeliveryProductRow {
  key: string;
  productName: string;
  measureUnitName: string;
  amount: number;
}

export default function ListaDeRepartoPorDias() {
  const dispatch = useAppDispatch();
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(dayjs());
  const [selectedDays, setSelectedDays] = useState<string[]>([getTodayIso()]);
  const [todayIso] = useState(getTodayIso);
  const [isPrintingDelivery, setIsPrintingDelivery] = useState(false);

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

  const { data: products = [], isFetching: isFetchingProducts } =
    useGetProductsQuery();
  const { data: measureUnits = [], isFetching: isFetchingMeasureUnits } =
    useGetMeasureUnitsQuery();
  const isLoadingDeliveryData =
    isFetchingDelivery || isFetchingProducts || isFetchingMeasureUnits;

  const measureUnitNameById = useMemo(
    () => buildMeasureUnitNameById(measureUnits),
    [measureUnits],
  );
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const productByNormalizedName = useMemo(
    () =>
      new Map(
        products.map((product) => [
          String(product.name || "")
            .trim()
            .toLowerCase(),
          product,
        ]),
      ),
    [products],
  );

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
              deliveryProducts.length === 0 ||
              isPrintingDelivery ||
              isLoadingDeliveryData
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

        {isLoadingDeliveryData ? (
          <TableLoadingSkeleton columns={3} rows={7} />
        ) : (
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
            <Table size="small" sx={{ minWidth: 620 }}>
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
    </Box>
  );
}
