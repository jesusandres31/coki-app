import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { PrintRounded, RestartAltRounded } from "@mui/icons-material";
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  useGetMeasureUnitsQuery,
  useGetProductTypesListQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { getListArgsInitialState } from "src/constants";
import { setSnackbar } from "src/slices/uiSlice";
import { GetList } from "src/types";
import { ProductsResponse } from "src/types/pocketbase-types";
import { formatMoney } from "src/utils/format";
import { openPriceListPdfInViewer, openPriceListPdfTab } from "../pdf";
import { getProductTypeIds, roundPrice, toNumber } from "../reportUtils";

interface NamedOption {
  id: string;
  name: string;
}

interface PriceListBaseRow {
  id: string;
  productName: string;
  productTypesText: string;
  measureUnitName: string;
  baseUnitPrice: number;
}

interface PriceListProductRow extends PriceListBaseRow {
  unitPrice: number;
  hasManualPrice: boolean;
}

const priceColumnSx = {
  position: "sticky",
  right: 0,
  width: 156,
  minWidth: 156,
  maxWidth: 156,
  boxSizing: "border-box",
};

export default function ListaDePrecios() {
  const dispatch = useAppDispatch();
  const [isPrintingPriceList, setIsPrintingPriceList] = useState(false);
  const [includeAllPriceListProducts, setIncludeAllPriceListProducts] =
    useState(true);
  const [selectedPriceListTypeIds, setSelectedPriceListTypeIds] = useState<
    string[]
  >([]);
  const [selectedPriceListProductIds, setSelectedPriceListProductIds] =
    useState<string[]>([]);
  const [sessionManualPriceByProductId, setSessionManualPriceByProductId] =
    useState<Record<string, number>>({});
  const [sessionPercentAdjustment, setSessionPercentAdjustment] = useState(0);
  const [sessionPercentDraft, setSessionPercentDraft] = useState("0");
  const [isPercentEditorOpen, setIsPercentEditorOpen] = useState(false);
  const [editingPriceProductId, setEditingPriceProductId] = useState<
    string | null
  >(null);
  const [editingPriceDraft, setEditingPriceDraft] = useState("");

  const { data: products = [] } = useGetProductsQuery();
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery();

  const productTypesQueryArgs = useMemo<GetList>(
    () => ({
      ...getListArgsInitialState,
      page: 1,
      perPage: 500,
      order: "asc",
      orderBy: "name",
    }),
    [],
  );

  const {
    data: productTypesList,
    error: priceListTypesError,
    isFetching: isFetchingPriceListTypes,
  } = useGetProductTypesListQuery(productTypesQueryArgs);
  const productTypes = productTypesList?.items || [];

  const measureUnitNameById = useMemo(
    () =>
      new Map(measureUnits.map((unit) => [unit.id, String(unit.name || "-")])),
    [measureUnits],
  );

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const productTypeNameById = useMemo(
    () => new Map(productTypes.map((type) => [type.id, type.name])),
    [productTypes],
  );

  const productTypeOptions = useMemo<NamedOption[]>(
    () =>
      productTypes.map((type) => ({
        id: type.id,
        name: type.name,
      })),
    [productTypes],
  );

  const productOptions = useMemo<NamedOption[]>(
    () =>
      products.map((product) => ({
        id: product.id,
        name: String(product.name || "-"),
      })),
    [products],
  );

  const selectedPriceTypeSet = useMemo(
    () => new Set(selectedPriceListTypeIds),
    [selectedPriceListTypeIds],
  );
  const selectedPriceProductSet = useMemo(
    () => new Set(selectedPriceListProductIds),
    [selectedPriceListProductIds],
  );

  const selectedPriceTypeOptions = useMemo(
    () =>
      productTypeOptions.filter((option) =>
        selectedPriceTypeSet.has(option.id),
      ),
    [productTypeOptions, selectedPriceTypeSet],
  );
  const selectedPriceProductOptions = useMemo(
    () =>
      productOptions.filter((option) => selectedPriceProductSet.has(option.id)),
    [productOptions, selectedPriceProductSet],
  );

  const selectedPriceTypeNames = useMemo(
    () =>
      selectedPriceListTypeIds
        .map((typeId) => productTypeNameById.get(typeId))
        .filter((name): name is string => Boolean(name)),
    [productTypeNameById, selectedPriceListTypeIds],
  );

  const selectedPriceProductNames = useMemo(
    () =>
      selectedPriceListProductIds
        .map((productId) => productById.get(productId))
        .filter((product): product is ProductsResponse => Boolean(product))
        .map((product) => String(product.name || "-")),
    [productById, selectedPriceListProductIds],
  );

  const priceListBaseRows = useMemo<PriceListBaseRow[]>(() => {
    const filteredProducts = products.filter((product) => {
      if (includeAllPriceListProducts) return true;
      const matchesType =
        selectedPriceTypeSet.size > 0 &&
        getProductTypeIds(product).some((typeId) =>
          selectedPriceTypeSet.has(typeId),
        );
      const matchesManual = selectedPriceProductSet.has(product.id);

      return matchesType || matchesManual;
    });

    return filteredProducts
      .map((product) => {
        const typeNames = getProductTypeIds(product)
          .map((typeId) => productTypeNameById.get(typeId))
          .filter((name): name is string => Boolean(name && name.trim()));

        return {
          id: product.id,
          productName: String(product.name || "-"),
          productTypesText: typeNames.length > 0 ? typeNames.join(", ") : "-",
          measureUnitName:
            measureUnitNameById.get(String(product.measure_unit || "")) || "-",
          baseUnitPrice: roundPrice(Math.max(0, toNumber(product.unit_price))),
        };
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }, [
    includeAllPriceListProducts,
    measureUnitNameById,
    productTypeNameById,
    products,
    selectedPriceProductSet,
    selectedPriceTypeSet,
  ]);

  const priceListRows = useMemo<PriceListProductRow[]>(
    () =>
      priceListBaseRows.map((row) => {
        const adjustedPrice = roundPrice(
          Math.max(0, row.baseUnitPrice * (1 + sessionPercentAdjustment / 100)),
        );
        const manualPrice = sessionManualPriceByProductId[row.id];
        const hasManualPrice = Number.isFinite(manualPrice);

        return {
          ...row,
          unitPrice: hasManualPrice
            ? roundPrice(Math.max(0, manualPrice))
            : adjustedPrice,
          hasManualPrice,
        };
      }),
    [
      priceListBaseRows,
      sessionManualPriceByProductId,
      sessionPercentAdjustment,
    ],
  );

  useEffect(() => {
    if (!editingPriceProductId) return;
    const exists = priceListRows.some(
      (row) => row.id === editingPriceProductId,
    );
    if (!exists) {
      setEditingPriceProductId(null);
      setEditingPriceDraft("");
    }
  }, [editingPriceProductId, priceListRows]);

  const priceListFilterSummary = useMemo(() => {
    if (includeAllPriceListProducts) {
      return "Lista completa de productos";
    }

    const clauses: string[] = [];

    if (selectedPriceTypeNames.length > 0) {
      clauses.push(`Tipos: ${selectedPriceTypeNames.join(", ")}`);
    }
    if (selectedPriceProductNames.length > 0) {
      clauses.push(`Selección manual: ${selectedPriceProductNames.join(", ")}`);
    }

    return clauses.length > 0
      ? clauses.join(" | ")
      : "Sin filtros (lista vacía hasta seleccionar productos o tipos).";
  }, [
    includeAllPriceListProducts,
    selectedPriceProductNames,
    selectedPriceTypeNames,
  ]);

  const handleResetPriceListFilters = () => {
    setIncludeAllPriceListProducts(true);
    setSelectedPriceListTypeIds([]);
    setSelectedPriceListProductIds([]);
  };

  const handleOpenPriceEditor = (row: PriceListProductRow) => {
    setEditingPriceProductId(row.id);
    setEditingPriceDraft(String(row.unitPrice));
  };

  const handleClosePriceEditor = () => {
    setEditingPriceProductId(null);
    setEditingPriceDraft("");
  };

  const handleCommitPriceEditor = (productId: string) => {
    const normalized = editingPriceDraft.replace(",", ".").trim();

    if (!normalized) {
      setSessionManualPriceByProductId((prev) => {
        if (!(productId in prev)) return prev;
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      handleClosePriceEditor();
      return;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      dispatch(
        setSnackbar({
          message: "Ingresá un precio válido mayor o igual a 0.",
          type: "error",
        }),
      );
      handleClosePriceEditor();
      return;
    }

    setSessionManualPriceByProductId((prev) => ({
      ...prev,
      [productId]: roundPrice(parsed),
    }));
    handleClosePriceEditor();
  };

  const handleApplyPercentAdjustment = () => {
    const normalized = sessionPercentDraft.replace(",", ".").trim();
    const parsed = Number(normalized);

    if (!Number.isFinite(parsed)) {
      dispatch(
        setSnackbar({
          message: "Ingresá un porcentaje válido para aplicar el ajuste.",
          type: "error",
        }),
      );
      return;
    }

    setSessionPercentAdjustment(parsed);
    setSessionPercentDraft(
      Number.isInteger(parsed) ? String(parsed) : roundPrice(parsed).toString(),
    );
  };

  const handlePrintPriceList = async () => {
    if (priceListRows.length === 0) {
      dispatch(
        setSnackbar({
          message:
            "No hay productos para imprimir. Ajustá los filtros y volvé a intentar.",
          type: "error",
        }),
      );
      return;
    }

    const popup = openPriceListPdfTab();

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

    setIsPrintingPriceList(true);

    try {
      await openPriceListPdfInViewer(
        {
          generatedAt: dayjs().format("DD/MM/YYYY HH:mm"),
          items: priceListRows.map((row) => ({
            id: row.id,
            productName: row.productName,
            measureUnitName: row.measureUnitName,
            unitPrice: formatMoney(row.unitPrice),
          })),
          totalItems: priceListRows.length,
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
      setIsPrintingPriceList(false);
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
          spacing={1.5}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Lista de precios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Armá una lista personalizada para cada cliente y obtenela lista
              para imprimir y entregar.
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<PrintRounded />}
            onClick={() => void handlePrintPriceList()}
            loading={isPrintingPriceList}
            loadingPosition="start"
            disabled={priceListRows.length === 0 || isPrintingPriceList}
          >
            Imprimir lista
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={includeAllPriceListProducts}
                onChange={(event) =>
                  setIncludeAllPriceListProducts(event.target.checked)
                }
                size="small"
              />
            }
            label="Incluir todos los productos"
          />

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltRounded />}
            onClick={handleResetPriceListFilters}
            disabled={
              includeAllPriceListProducts &&
              selectedPriceListTypeIds.length === 0 &&
              selectedPriceListProductIds.length === 0
            }
          >
            Restablecer filtros
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <Autocomplete
            fullWidth
            multiple
            size="small"
            options={productTypeOptions}
            value={selectedPriceTypeOptions}
            onChange={(_event, value) => {
              setSelectedPriceListTypeIds(value.map((item) => item.id));
              if (value.length > 0) {
                setIncludeAllPriceListProducts(false);
              }
            }}
            loading={isFetchingPriceListTypes}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            noOptionsText="Sin tipos disponibles"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filtrar por tipos de producto"
                placeholder="Seleccionar tipos"
              />
            )}
          />
          <Autocomplete
            fullWidth
            multiple
            size="small"
            options={productOptions}
            value={selectedPriceProductOptions}
            renderTags={(value, getTagProps) => {
              const visibleItems = value.slice(0, 2);
              const hiddenCount = value.length - visibleItems.length;

              return [
                ...visibleItems.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    size="small"
                    label={option.name}
                  />
                )),
                ...(hiddenCount > 0
                  ? [
                      <Chip
                        key="manual-products-hidden-count"
                        size="small"
                        label={`+${hiddenCount} más`}
                      />,
                    ]
                  : []),
              ];
            }}
            onChange={(_event, value) => {
              setSelectedPriceListProductIds(value.map((item) => item.id));
              if (value.length > 0) {
                setIncludeAllPriceListProducts(false);
              }
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            noOptionsText="Sin productos disponibles"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Agregar productos manuales"
                placeholder="Seleccionar productos"
              />
            )}
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            minWidth: 0,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            Filtro activo:
          </Typography>
          <Typography
            variant="body2"
            color="text.primary"
            fontWeight={700}
            title={priceListFilterSummary}
            sx={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {priceListFilterSummary}
          </Typography>
        </Box>

        {!isPercentEditorOpen && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => setIsPercentEditorOpen(true)}
              disabled={priceListRows.length === 0}
            >
              Modificar precio por porcentaje
            </Button>
            <Typography variant="caption" color="text.secondary">
              Los cambios de precio se guardan solo en esta sesión de impresión.
            </Typography>
          </Stack>
        )}

        {isPercentEditorOpen && (
          <Stack spacing={0.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                size="small"
                type="number"
                variant="outlined"
                label="Ajuste global (%)"
                value={sessionPercentDraft}
                onChange={(event) => setSessionPercentDraft(event.target.value)}
                inputProps={{ step: "0.01" }}
                sx={{ minWidth: { md: 220 } }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={handleApplyPercentAdjustment}
              >
                Aplicar
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setSessionPercentAdjustment(0);
                  setSessionPercentDraft("0");
                  setIsPercentEditorOpen(false);
                }}
              >
                Quitar ajustes
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Positivo aumenta, negativo reduce.
            </Typography>
          </Stack>
        )}

        {priceListTypesError && (
          <Alert severity="error">
            No se pudieron cargar los tipos de producto para aplicar filtros.
          </Alert>
        )}

        {!includeAllPriceListProducts &&
          selectedPriceListTypeIds.length === 0 &&
          selectedPriceListProductIds.length === 0 && (
            <Alert severity="info">
              Seleccioná al menos un tipo de producto o uno/más productos
              manuales para armar una lista personalizada.
            </Alert>
          )}

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
          <Table size="small" stickyHeader sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    ...priceColumnSx,
                    zIndex: 3,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  Precio
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceListRows.length > 0 ? (
                priceListRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.productTypesText}</TableCell>
                    <TableCell>{row.measureUnitName}</TableCell>
                    <TableCell
                      align="right"
                      role={
                        editingPriceProductId === row.id ? undefined : "button"
                      }
                      tabIndex={editingPriceProductId === row.id ? -1 : 0}
                      onClick={
                        editingPriceProductId === row.id
                          ? undefined
                          : () => handleOpenPriceEditor(row)
                      }
                      onKeyDown={
                        editingPriceProductId === row.id
                          ? undefined
                          : (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleOpenPriceEditor(row);
                              }
                            }
                      }
                      title={
                        editingPriceProductId === row.id
                          ? undefined
                          : "Click para editar el precio en esta sesión"
                      }
                      sx={{
                        ...priceColumnSx,
                        py: 0.75,
                        zIndex: 1,
                        backgroundColor: "action.hover",
                        cursor:
                          editingPriceProductId === row.id ? "text" : "pointer",
                        transition: "background-color 120ms ease",
                        "&:hover": {
                          backgroundColor:
                            editingPriceProductId === row.id
                              ? "action.hover"
                              : "action.selected",
                        },
                        "&:focus-visible": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                          outlineOffset: "-2px",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          minWidth: 120,
                          maxWidth: 120,
                          height: 24,
                          ml: "auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {editingPriceProductId === row.id ? (
                          <TextField
                            autoFocus
                            size="small"
                            type="number"
                            variant="standard"
                            value={editingPriceDraft}
                            onChange={(event) =>
                              setEditingPriceDraft(event.target.value)
                            }
                            onBlur={() => handleCommitPriceEditor(row.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleCommitPriceEditor(row.id);
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                handleClosePriceEditor();
                              }
                            }}
                            inputProps={{ min: 0, step: "0.01" }}
                            sx={{
                              width: "100%",
                              "& .MuiInputBase-root": {
                                height: 24,
                              },
                              "& .MuiInputBase-input": {
                                py: 0,
                                textAlign: "right",
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            fontWeight={row.hasManualPrice ? 700 : 500}
                            sx={{ width: "100%", textAlign: "right" }}
                          >
                            {formatMoney(row.unitPrice)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay productos para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            Productos en la lista:{" "}
            <Box component="span" fontWeight={700} color="text.primary">
              {priceListRows.length}
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Formato preparado para impresión física.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
