import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";
import {
  AddRounded,
  CancelRounded,
  DeleteRounded,
  OpenInNewRounded,
  PrintRounded,
  SaveRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Theme } from "@mui/material/styles";
import { useAppDispatch } from "src/app/store";
import {
  useCreateInvoiceMutation,
  useGetClientsQuery,
  useGetInvoiceViewByIdQuery,
  useGetInvoiceStatesQuery,
  useGetMeasureUnitsQuery,
  useGetProductsQuery,
  useUpdateInvoiceMutation,
} from "src/app/services/invoiceService";
import { ErrorMsg, Loading } from "src/components/common";
import EntityFormContainer from "src/components/common/Forms/EntityFormContainer";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { SEARCH } from "src/constants";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { formatMoney, formatPercent } from "src/utils/format";
import { invoiceBreadcrumbFlow } from "./breadcrumbFlow";
import {
  buildInvoicePdfModel,
  openInvoicePdfInViewer,
  openInvoicePdfTab,
} from "./pdf";

type InvoicePageMode = "new" | "review" | "edit";
type InvoiceState = "draft" | "open" | "void";

interface InvoiceProductInput {
  id: string;
  product: string;
  amount: number;
  unitPrice: number;
  discount: number;
}

interface InvoiceProductRow {
  id?: string;
  product_id?: string;
  product?: { id?: string; name?: string } | string | null;
  product_name?: string;
  amount?: number;
  unit_price?: number;
  discount?: number;
  total?: number;
}

interface NamedOption {
  id: string;
  name: string;
}

interface DebouncedAutocompleteProps {
  options: NamedOption[];
  valueId: string;
  onChange: (valueId: string) => void;
  label?: string;
  placeholder?: string;
  variant?: "outlined" | "standard";
  disabled?: boolean;
}

interface ProductTableRowData {
  id: string;
  productId: string;
  productName: string;
  measureUnitName: string;
  amount: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface ProductsTableProps {
  rows: ProductTableRowData[];
  editable: boolean;
  productOptions: NamedOption[];
  onRowChange?: (
    id: string,
    field: keyof Omit<InvoiceProductInput, "id">,
    value: string | number,
  ) => void;
  onRemoveRow?: (id: string) => void;
  canRemoveRow?: (id: string) => boolean;
}

interface InvoiceTotalsSummaryProps {
  subtotal: number;
  discountPercent: number;
  total: number;
}

interface InvoiceFormValues {
  client: string;
  date: string;
  discount: number;
  rows: InvoiceProductInput[];
}

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const parsePickerDate = (value: string) => (value ? dayjs(value) : null);
const formatPickerDate = (value: Dayjs | null) =>
  value ? value.format("YYYY-MM-DD") : "";
const normalizeIsoDate = (value: string) => {
  const parsed = dayjs(value, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return "";

  const year = parsed.year();
  if (year < 2000 || year > 2100) return "";

  return parsed.format("YYYY-MM-DD");
};

const getRowId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const buildEmptyRow = (): InvoiceProductInput => ({
  id: getRowId(),
  product: "",
  amount: 0,
  unitPrice: 0,
  discount: 0,
});

const getCreateItemTotal = (item: InvoiceProductInput) =>
  Math.max(
    0,
    item.amount *
      item.unitPrice *
      (1 - Math.max(0, Math.min(100, item.discount)) / 100),
  );

const clampDiscount = (value: number) => Math.min(100, Math.max(0, value));

const hasInvalidInvoiceRows = (rows: InvoiceProductInput[]) =>
  rows.some(
    (row) =>
      !row.product ||
      row.amount <= 0 ||
      row.unitPrice < 0 ||
      row.discount < 0 ||
      row.discount > 100,
  );

const readableDisabledFieldSx = (theme: Theme) => ({
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: theme.palette.text.primary,
    color: theme.palette.text.primary,
    opacity: 1,
  },
  "& .MuiPickersInputBase-root.Mui-disabled": {
    color: theme.palette.text.primary,
    WebkitTextFillColor: theme.palette.text.primary,
    opacity: 1,
  },
  "& .MuiPickersInputBase-root.Mui-disabled .MuiPickersSectionList-root": {
    color: theme.palette.text.primary,
    WebkitTextFillColor: theme.palette.text.primary,
    opacity: 1,
  },
  "& .MuiPickersInputBase-root.Mui-disabled .MuiPickersSectionList-section": {
    color: theme.palette.text.primary,
    WebkitTextFillColor: theme.palette.text.primary,
    opacity: 1,
  },
  "& .MuiPickersInputBase-root.Mui-disabled .MuiPickersSectionList-sectionSeparator":
    {
      color: theme.palette.text.primary,
      WebkitTextFillColor: theme.palette.text.primary,
      opacity: 1,
    },
  "& .MuiInputBase-root.Mui-disabled": {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 1,
  },
  "& .MuiFormLabel-root.Mui-disabled": {
    color: theme.palette.text.primary,
  },
});

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

const getInvoiceStateValue = (value: unknown) => {
  if (typeof value === "string") return value;

  if (value && typeof value === "object" && "name" in value) {
    const stateName = (value as { name?: unknown }).name;
    return typeof stateName === "string" ? stateName : "";
  }

  return "";
};

function DebouncedAutocomplete({
  options,
  valueId,
  onChange,
  label,
  placeholder,
  variant = "outlined",
  disabled = false,
}: DebouncedAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => option.id === valueId) || null,
    [options, valueId],
  );

  useEffect(() => {
    setInputValue(selectedOption?.name || "");
  }, [selectedOption?.id, selectedOption?.name]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, SEARCH.debounceMs);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  const filteredOptions = useMemo(() => {
    const query = debouncedInputValue.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      option.name.toLowerCase().includes(query),
    );
  }, [debouncedInputValue, options]);

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={filteredOptions}
      value={selectedOption}
      inputValue={inputValue}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name}
      onInputChange={(_event, value) => setInputValue(value)}
      onChange={(_event, value) => onChange(value?.id || "")}
      noOptionsText="Sin resultados"
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          variant={variant}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
}

function ProductsTable({
  rows,
  editable,
  productOptions,
  onRowChange,
  onRemoveRow,
  canRemoveRow,
}: ProductsTableProps) {
  return (
    <TableContainer
      sx={{
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        flex: "1 1 0",
        minHeight: 0,
        minWidth: 0,
        overflowY: "auto",
        overflowX: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <Table size="small" stickyHeader sx={{ minWidth: editable ? 980 : 920 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "31%" }}>Producto</TableCell>
            <TableCell sx={{ width: "12%" }}>Cantidad</TableCell>
            <TableCell sx={{ width: "12%" }}>Unidad</TableCell>
            <TableCell sx={{ width: "14%" }}>Precio unit.</TableCell>
            <TableCell sx={{ width: "14%" }}>Descuento (%)</TableCell>
            <TableCell sx={{ width: "15%" }} align="right">
              Total
            </TableCell>
            {editable && <TableCell sx={{ width: 56 }} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                {editable ? (
                  <DebouncedAutocomplete
                    options={productOptions}
                    valueId={row.productId}
                    placeholder="Seleccionar producto"
                    variant="standard"
                    onChange={(value) =>
                      onRowChange?.(row.id, "product", value)
                    }
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    value={row.productName}
                    disabled
                    sx={readableDisabledFieldSx}
                  />
                )}
              </TableCell>

              <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="standard"
                  type="number"
                  value={row.amount <= 0 ? "" : row.amount}
                  onChange={(e) =>
                    onRowChange?.(
                      row.id,
                      "amount",
                      e.target.value === ""
                        ? 0
                        : Math.max(1, Number(e.target.value || 1)),
                    )
                  }
                  inputProps={{ min: 1, step: 1 }}
                  disabled={!editable}
                  sx={readableDisabledFieldSx}
                />
              </TableCell>

              <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="standard"
                  value={row.measureUnitName}
                  disabled
                  sx={readableDisabledFieldSx}
                />
              </TableCell>

              <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="standard"
                  type="number"
                  value={row.unitPrice}
                  onChange={(e) =>
                    onRowChange?.(
                      row.id,
                      "unitPrice",
                      Math.max(0, Number(e.target.value || 0)),
                    )
                  }
                  inputProps={{ min: 0, step: "0.01" }}
                  disabled={!editable}
                  sx={readableDisabledFieldSx}
                />
              </TableCell>

              <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="standard"
                  type="number"
                  value={row.discount}
                  onChange={(e) =>
                    onRowChange?.(
                      row.id,
                      "discount",
                      clampDiscount(Number(e.target.value || 0)),
                    )
                  }
                  inputProps={{ min: 0, max: 100, step: "0.01" }}
                  disabled={!editable}
                  sx={readableDisabledFieldSx}
                />
              </TableCell>

              <TableCell
                align="right"
                sx={{ py: 0.75, verticalAlign: "middle" }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {formatMoney(row.total)}
                </Typography>
              </TableCell>

              {editable && (
                <TableCell
                  align="center"
                  sx={{ py: 0.75, verticalAlign: "middle" }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onRemoveRow?.(row.id)}
                    disabled={!canRemoveRow?.(row.id)}
                    sx={{
                      width: 30,
                      height: 30,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.25,
                      p: 0.5,
                    }}
                  >
                    <DeleteRounded />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function InvoiceTotalsSummary({
  subtotal,
  discountPercent,
  total,
}: InvoiceTotalsSummaryProps) {
  const totalRows = [
    { label: "Subtotal", value: formatMoney(subtotal) },
    { label: "Descuento factura", value: formatPercent(discountPercent) },
  ];

  return (
    <Stack spacing={1.25} sx={{ width: "100%" }}>
      {totalRows.map((row) => (
        <Stack
          key={row.label}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="body2" color="text.secondary">
            {row.label}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight={600}>
            {row.value}
          </Typography>
        </Stack>
      ))}
      <Divider />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        spacing={1}
      >
        <Typography variant="subtitle2" color="text.primary">
          Total
        </Typography>
        <Typography variant="h6" fontWeight={700} textAlign="right">
          {formatMoney(total)}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function InvoiceFormPage() {
  const { invoiceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();

  const isDetailRoute = Boolean(invoiceId);
  const requestedDetailMode =
    searchParams.get("mode") === "edit" ? "edit" : "review";
  const [mode, setMode] = useState<InvoicePageMode>(
    isDetailRoute ? requestedDetailMode : "new",
  );
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    setMode(isDetailRoute ? requestedDetailMode : "new");
  }, [isDetailRoute, requestedDetailMode]);

  const isNewMode = mode === "new";
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (isNewMode) {
      dispatch(setBreadcrumbs(invoiceBreadcrumbFlow.create()));
      return;
    }

    dispatch(
      setBreadcrumbs(invoiceBreadcrumbFlow.detail(invoiceId || "", isEditMode)),
    );
  }, [dispatch, invoiceId, isEditMode, isNewMode]);

  useEffect(() => {
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const { data: clients = [] } = useGetClientsQuery(undefined, {
    skip: !isNewMode && !isEditMode,
  });
  const { data: invoiceStates = [] } = useGetInvoiceStatesQuery(undefined, {
    skip: !isDetailRoute,
  });
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery(undefined, {
    skip: !isNewMode && !isDetailRoute,
  });
  const { data: products = [], isLoading: isProductsLoading } =
    useGetProductsQuery(undefined, { skip: !isNewMode && !isDetailRoute });
  const {
    data: invoice,
    isFetching,
    error,
  } = useGetInvoiceViewByIdQuery(invoiceId || "", {
    skip: !isDetailRoute,
  });

  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const clientOptions = useMemo<NamedOption[]>(
    () =>
      clients.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [clients],
  );
  const productOptions = useMemo<NamedOption[]>(
    () =>
      products.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [products],
  );

  const measureUnitById = useMemo(
    () =>
      new Map(measureUnits.map((unit) => [unit.id, String(unit.name || "-")])),
    [measureUnits],
  );

  const invoiceStateByName = useMemo(
    () =>
      new Map(
        invoiceStates.map((state) => [
          String(state.name || "").toLowerCase(),
          state,
        ]),
      ),
    [invoiceStates],
  );

  const newFormik = useFormik<InvoiceFormValues>({
    initialValues: {
      client: "",
      date: getLocalDate(),
      discount: 0,
      rows: [buildEmptyRow()],
    },
    onSubmit: async (values) => {
      const normalizedDate = normalizeIsoDate(values.date);
      if (!normalizedDate) {
        dispatch(
          setSnackbar({
            message: "Fecha inválida. Seleccioná una fecha entre 2000 y 2100.",
            type: "error",
          }),
        );
        return;
      }

      if (!values.client) {
        dispatch(
          setSnackbar({ message: "Seleccioná un cliente.", type: "error" }),
        );
        return;
      }

      const invalidRows = hasInvalidInvoiceRows(values.rows);

      if (values.rows.length === 0 || invalidRows) {
        dispatch(
          setSnackbar({
            message:
              "Completá los productos con cantidad válida, precio y descuentos correctos.",
            type: "error",
          }),
        );
        return;
      }

      try {
        const created = await createInvoice({
          client: values.client,
          date: normalizedDate,
          discount: values.discount,
          state: "open",
          items: values.rows.map((row) => ({
            product: row.product,
            amount: row.amount,
            unitPrice: row.unitPrice,
            discount: row.discount,
          })),
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Factura creada satisfactoriamente.",
            type: "success",
          }),
        );
        handleGoTo(`${AppRoutes.Invoices}/${created.invoice.id}`);
      } catch {
        // Error feedback is already handled by RTK middleware.
      }
    },
  });

  const editFormik = useFormik<InvoiceFormValues>({
    initialValues: {
      client: "",
      date: "",
      discount: 0,
      rows: [buildEmptyRow()],
    },
    onSubmit: async (values) => {
      if (!invoiceId) return;
      const normalizedDate = normalizeIsoDate(values.date);
      if (!normalizedDate) {
        dispatch(
          setSnackbar({
            message: "Fecha inválida. Seleccioná una fecha entre 2000 y 2100.",
            type: "error",
          }),
        );
        return;
      }

      const parsedInvoiceClient = parseJsonValue<{
        id?: string;
        name?: string;
      }>(invoice?.client);
      const selectedClientId = values.client || parsedInvoiceClient?.id || "";

      const normalizedRows = values.rows.map((row) => {
        const normalizedProductId = productById.has(row.product)
          ? row.product
          : products.find((product) => product.name === row.product)?.id || "";

        return {
          ...row,
          product: normalizedProductId,
        };
      });

      if (!selectedClientId) {
        dispatch(
          setSnackbar({ message: "Seleccioná un cliente.", type: "error" }),
        );
        return;
      }

      const invalidRows = hasInvalidInvoiceRows(normalizedRows);

      if (values.rows.length === 0 || invalidRows) {
        dispatch(
          setSnackbar({
            message:
              "Completá los productos con cantidad válida, precio y descuentos correctos.",
            type: "error",
          }),
        );
        return;
      }

      try {
        await updateInvoice({
          id: invoiceId,
          data: {
            client: selectedClientId,
            date: normalizedDate,
            discount: values.discount,
          },
          items: normalizedRows.map((row) => ({
            product: row.product,
            amount: row.amount,
            unitPrice: row.unitPrice,
            discount: row.discount,
          })),
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Factura actualizada satisfactoriamente.",
            type: "success",
          }),
        );
        setSearchParams({ mode: "review" });
      } catch {
        // Error feedback is already handled by RTK middleware.
      }
    },
  });

  useEffect(() => {
    if (!invoice || isNewMode || isEditMode) return;

    const parsedClient = parseJsonValue<{ id?: string; name?: string }>(
      invoice.client,
    );

    const rawInvoiceProducts =
      parseJsonValue<InvoiceProductRow[]>(invoice.invoice_products) || [];

    const detailRows =
      Array.isArray(rawInvoiceProducts) && rawInvoiceProducts.length > 0
        ? rawInvoiceProducts.map((item, i) => ({
            id: item.id || `row-${i}`,
            product:
              String(
                item.product_id ??
                  (typeof item.product === "string"
                    ? item.product
                    : item.product?.id) ??
                  "",
              ) || "",
            amount: Math.max(1, Number(item.amount ?? 1)),
            unitPrice: Math.max(0, Number(item.unit_price ?? 0)),
            discount: Math.min(100, Math.max(0, Number(item.discount ?? 0))),
          }))
        : [buildEmptyRow()];

    editFormik.setValues({
      client: parsedClient?.id || "",
      date: String(invoice.date).slice(0, 10),
      discount: Number(invoice.discount ?? 0),
      rows: detailRows,
    });
  }, [invoice, isEditMode, isNewMode]);

  const invoiceProducts: InvoiceProductRow[] = useMemo(() => {
    const parsed = parseJsonValue<InvoiceProductRow[]>(
      invoice?.invoice_products,
    );
    if (!parsed || !Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  }, [invoice?.invoice_products]);

  const productById = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          {
            id: product.id,
            name: product.name,
            unitPrice: Number(product.unit_price ?? 0),
            measureUnitId: String(product.measure_unit || ""),
          },
        ]),
      ),
    [products],
  );

  const newSubtotal = useMemo(
    () =>
      newFormik.values.rows.reduce(
        (acc, row) => acc + getCreateItemTotal(row),
        0,
      ),
    [newFormik.values.rows],
  );
  const newTotal = useMemo(
    () => Math.max(0, newSubtotal * (1 - newFormik.values.discount / 100)),
    [newFormik.values.discount, newSubtotal],
  );

  const detailSubtotal = useMemo(
    () =>
      editFormik.values.rows.reduce(
        (acc, row) => acc + getCreateItemTotal(row),
        0,
      ),
    [editFormik.values.rows],
  );
  const detailTotal = useMemo(
    () => Math.max(0, detailSubtotal * (1 - editFormik.values.discount / 100)),
    [detailSubtotal, editFormik.values.discount],
  );

  const currentInvoiceState = useMemo(() => {
    const rawState = getInvoiceStateValue(
      (invoice as typeof invoice & { state?: unknown })?.state,
    ).toLowerCase();

    if (rawState === "draft" || rawState === "open" || rawState === "void") {
      return rawState as InvoiceState;
    }

    return "";
  }, [invoice]);

  const stateActionConfig = useMemo(() => {
    if (currentInvoiceState === "open") {
      return {
        nextState: "void" as InvoiceState,
        label: "Anular factura",
        color: "error" as const,
      };
    }

    if (currentInvoiceState === "void") {
      return {
        nextState: "open" as InvoiceState,
        label: "Confirmar factura",
        color: "success" as const,
      };
    }

    if (currentInvoiceState === "draft") {
      return {
        nextState: "open" as InvoiceState,
        label: "Confirmar factura",
        color: "success" as const,
      };
    }

    return null;
  }, [currentInvoiceState]);

  const createTableRows = useMemo<ProductTableRowData[]>(
    () =>
      newFormik.values.rows.map((row) => {
        const productName =
          productOptions.find((option) => option.id === row.product)?.name ||
          "";
        return {
          id: row.id,
          productId: row.product,
          productName,
          measureUnitName:
            measureUnitById.get(
              productById.get(row.product)?.measureUnitId || "",
            ) || "-",
          amount: row.amount,
          unitPrice: row.unitPrice,
          discount: row.discount,
          total: getCreateItemTotal(row),
        };
      }),
    [newFormik.values.rows, productOptions, measureUnitById, productById],
  );

  const detailTableRows = useMemo<ProductTableRowData[]>(
    () =>
      editFormik.values.rows.map((row) => {
        const productName =
          productOptions.find((option) => option.id === row.product)?.name ||
          invoiceProducts.find((item) => item.id === row.id)?.product_name ||
          "-";

        return {
          id: row.id,
          productId: row.product,
          productName,
          measureUnitName:
            measureUnitById.get(
              productById.get(row.product)?.measureUnitId || "",
            ) || "-",
          amount: row.amount,
          unitPrice: row.unitPrice,
          discount: row.discount,
          total: getCreateItemTotal(row),
        };
      }),
    [
      editFormik.values.rows,
      invoiceProducts,
      measureUnitById,
      productById,
      productOptions,
    ],
  );

  const hasInvalidRows = hasInvalidInvoiceRows(newFormik.values.rows);
  const canCreate =
    !!newFormik.values.client &&
    newFormik.values.rows.length > 0 &&
    !hasInvalidRows;

  const submitNewInvoice = async (targetState: InvoiceState) => {
    const values = newFormik.values;
    const normalizedDate = normalizeIsoDate(values.date);
    if (!normalizedDate) {
      dispatch(
        setSnackbar({
          message: "Fecha inválida. Seleccioná una fecha entre 2000 y 2100.",
          type: "error",
        }),
      );
      return;
    }

    if (!values.client) {
      dispatch(
        setSnackbar({ message: "Seleccioná un cliente.", type: "error" }),
      );
      return;
    }

    const invalidRows = hasInvalidInvoiceRows(values.rows);

    if (values.rows.length === 0 || invalidRows) {
      dispatch(
        setSnackbar({
          message:
            "Completá los productos con cantidad válida, precio y descuentos correctos.",
          type: "error",
        }),
      );
      return;
    }

    try {
      const created = await createInvoice({
        client: values.client,
        date: normalizedDate,
        discount: values.discount,
        state: targetState,
        items: values.rows.map((row) => ({
          product: row.product,
          amount: row.amount,
          unitPrice: row.unitPrice,
          discount: row.discount,
        })),
      }).unwrap();

      dispatch(
        setSnackbar({
          message:
            targetState === "draft"
              ? "Factura guardada como borrador."
              : "Factura creada satisfactoriamente.",
          type: "success",
        }),
      );

      setMode("review");
      handleGoTo(`${AppRoutes.Invoices}/${created.invoice.id}`);
    } catch {
      // Error feedback is already handled by RTK middleware.
    }
  };

  const handleCreateInvoice = () => {
    void submitNewInvoice("open");
  };

  const handleCreateDraft = () => {
    void submitNewInvoice("draft");
  };

  const activeFormik = isNewMode ? newFormik : editFormik;
  const isEditable = isNewMode || isEditMode;
  const tableRows = isNewMode ? createTableRows : detailTableRows;
  const summarySubtotal = isNewMode ? newSubtotal : detailSubtotal;
  const summaryTotal = isNewMode ? newTotal : detailTotal;
  const pageMode: "new" | "review" | "edit" = isNewMode
    ? "new"
    : isEditMode
      ? "edit"
      : "review";

  const parsedClient = parseJsonValue<{
    id?: string;
    name?: string;
  }>(invoice?.client);
  const invoiceClientName =
    parsedClient?.name ||
    (typeof invoice?.client === "string" ? invoice.client : "-");

  const reviewHeaderActions =
    !isNewMode && !isEditMode ? (
      <>
        <Button
          size="small"
          variant="contained"
          startIcon={<PrintRounded />}
          onClick={() => void handlePrintInvoice()}
          loading={isPrinting}
          loadingPosition="start"
          disabled={isPrinting}
        >
          Imprimir
        </Button>
        {stateActionConfig && (
          <Button
            size="small"
            variant="contained"
            color={stateActionConfig.color}
            startIcon={
              stateActionConfig.nextState === "void" ? (
                <CancelRounded />
              ) : stateActionConfig.nextState === "open" ? (
                <OpenInNewRounded />
              ) : undefined
            }
            onClick={() => void handleUpdateState(stateActionConfig.nextState)}
            loading={isUpdating}
            disabled={isUpdating}
          >
            {stateActionConfig.label}
          </Button>
        )}
      </>
    ) : undefined;

  const handleAddRow = () => {
    activeFormik.setFieldValue("rows", [
      ...activeFormik.values.rows,
      buildEmptyRow(),
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (activeFormik.values.rows.length <= 1) return;
    activeFormik.setFieldValue(
      "rows",
      activeFormik.values.rows.filter((row) => row.id !== id),
    );
  };

  const handleRowChange = (
    id: string,
    field: keyof Omit<InvoiceProductInput, "id">,
    value: string | number,
  ) => {
    activeFormik.setFieldValue(
      "rows",
      activeFormik.values.rows.map((row) => {
        if (row.id !== id) return row;

        if (field === "product") {
          const selected = productById.get(String(value));
          return {
            ...row,
            product: String(value),
            unitPrice: selected ? selected.unitPrice : row.unitPrice,
          };
        }

        return {
          ...row,
          [field]: Number(value),
        };
      }),
    );
  };

  const handleCancelEdit = () => {
    setSearchParams({ mode: "review" });
  };

  const handleUpdateState = async (nextState: InvoiceState) => {
    if (!invoiceId) return;

    const nextStateId = invoiceStateByName.get(nextState)?.id;

    if (!nextStateId) {
      dispatch(
        setSnackbar({
          message: "No se pudo identificar el estado de factura solicitado.",
          type: "error",
        }),
      );
      return;
    }

    try {
      await updateInvoice({
        id: invoiceId,
        data: {
          state: nextStateId,
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Estado de factura actualizado satisfactoriamente.",
          type: "success",
        }),
      );
    } catch {
      // Error feedback is already handled by RTK middleware.
    }
  };

  const handlePrintInvoice = async () => {
    if (!invoice) return;
    const popup = openInvoicePdfTab();

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

    setIsPrinting(true);

    try {
      const invoicePdfModel = buildInvoicePdfModel({
        invoice,
        products,
        measureUnits,
      });

      await openInvoicePdfInViewer(invoicePdfModel, popup);
    } catch {
      popup.close();
      dispatch(
        setSnackbar({
          message: "No se pudo generar o abrir el PDF en la pestaña nueva.",
          type: "error",
        }),
      );
    } finally {
      setIsPrinting(false);
    }
  };

  if (isDetailRoute && isFetching) {
    return (
      <PageContainer>
        <Container
          component="main"
          maxWidth="lg"
          sx={{ py: 3, width: "100%", mx: "auto" }}
        >
          <Card
            variant="outlined"
            sx={{
              minHeight: { xs: 320, md: 420 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loading />
            </Box>
          </Card>
        </Container>
      </PageContainer>
    );
  }

  if (isDetailRoute && (error || !invoice)) {
    return (
      <PageContainer>
        <Container
          component="main"
          maxWidth="lg"
          sx={{ py: 3, width: "100%", mx: "auto" }}
        >
          <Card
            variant="outlined"
            sx={{
              minHeight: { xs: 320, md: 420 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <ErrorMsg />
            </Box>
          </Card>
        </Container>
      </PageContainer>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <EntityFormContainer
        title={isNewMode ? "Crear factura" : `Factura "${invoice?.id || ""}"`}
        mode={pageMode}
        inputs={[]}
        formik={activeFormik}
        onBack={() => handleGoTo(AppRoutes.Invoices)}
        onEdit={
          !isNewMode ? () => setSearchParams({ mode: "edit" }) : undefined
        }
        onCancelEdit={isEditMode ? handleCancelEdit : undefined}
        onSubmit={isEditMode ? () => void editFormik.submitForm() : undefined}
        loading={isUpdating}
        submitDisabled={isUpdating}
        submitLabel="Guardar"
        headerActions={reviewHeaderActions}
        showDefaultNewSubmit={false}
        maxWidth="xl"
        containerSx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          height: { xs: "auto", md: "100%" },
          minHeight: 0,
        }}
        cardSx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
        }}
        contentSx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
          overflowY: { xs: "visible", lg: "hidden" },
          overflowX: "hidden",
        }}
      >
        <Stack
          spacing={3}
          sx={{
            display: { xs: "flex", lg: "none" },
            width: "100%",
            minWidth: 0,
          }}
        >
          <Stack spacing={1.5}>
            {isEditable ? (
              <DebouncedAutocomplete
                options={clientOptions}
                valueId={activeFormik.values.client}
                label="Cliente"
                placeholder="Seleccionar cliente"
                onChange={(value) =>
                  activeFormik.setFieldValue("client", value)
                }
              />
            ) : (
              <TextField
                fullWidth
                size="small"
                label="Cliente"
                value={invoiceClientName}
                disabled
                sx={readableDisabledFieldSx}
              />
            )}

            <DatePicker
              label="Fecha"
              value={parsePickerDate(activeFormik.values.date)}
              onChange={(value) =>
                activeFormik.setFieldValue("date", formatPickerDate(value))
              }
              format="DD/MM/YYYY"
              disabled={!isEditable}
              slotProps={{
                field: {
                  readOnly: true,
                },
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: !isEditable ? readableDisabledFieldSx : undefined,
                },
              }}
            />
          </Stack>

          <Stack spacing={1.5}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Productos
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<AddRounded />}
                onClick={isEditable ? handleAddRow : undefined}
                disabled={!isEditable || isProductsLoading}
                tabIndex={isEditable ? 0 : -1}
                aria-hidden={!isEditable}
                sx={{
                  width: "100%",
                  visibility: isEditable ? "visible" : "hidden",
                  pointerEvents: isEditable ? "auto" : "none",
                }}
              >
                Agregar producto
              </Button>
            </Stack>

            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                minHeight: 250,
                height: "25vh",
                maxHeight: 250,
              }}
            >
              <ProductsTable
                rows={tableRows}
                editable={isEditable}
                productOptions={productOptions}
                onRowChange={handleRowChange}
                onRemoveRow={handleRemoveRow}
                canRemoveRow={() => activeFormik.values.rows.length > 1}
              />
            </Box>
          </Stack>

          <Stack
            spacing={2}
            sx={{
              borderTop: "1px solid #E5E7EB",
              pt: 2.5,
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="Descuento factura (%)"
              type="number"
              value={activeFormik.values.discount}
              onChange={(e) =>
                activeFormik.setFieldValue(
                  "discount",
                  clampDiscount(Number(e.target.value || 0)),
                )
              }
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              disabled={!isEditable}
              sx={!isEditable ? readableDisabledFieldSx : undefined}
            />

            <InvoiceTotalsSummary
              subtotal={summarySubtotal}
              discountPercent={activeFormik.values.discount}
              total={summaryTotal}
            />
          </Stack>

          {isNewMode && (
            <Stack spacing={1} sx={{ width: "100%" }}>
              <Button
                size="small"
                variant="contained"
                color="info"
                startIcon={<SaveRounded />}
                onClick={handleCreateDraft}
                loading={isCreating}
                disabled={!canCreate || isCreating}
                sx={{ width: "100%" }}
              >
                Guardar borrador
              </Button>

              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<AddRounded />}
                onClick={handleCreateInvoice}
                loading={isCreating}
                disabled={!canCreate || isCreating}
                sx={{ width: "100%" }}
              >
                Crear factura
              </Button>
            </Stack>
          )}
        </Stack>

        <Box
          sx={{
            width: "100%",
            flex: "1 1 auto",
            minHeight: 0,
            minWidth: 0,
            height: { lg: "100%" },
            display: { xs: "none", lg: "grid" },
            gridTemplateColumns: {
              lg: "minmax(0, 85fr) minmax(220px, 15fr)",
            },
            gap: 2.25,
          }}
        >
          <Stack
            spacing={2.25}
            sx={{
              minHeight: 0,
              minWidth: 0,
              height: { lg: "100%" },
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                {isEditable ? (
                  <DebouncedAutocomplete
                    options={clientOptions}
                    valueId={activeFormik.values.client}
                    label="Cliente"
                    placeholder="Seleccionar cliente"
                    onChange={(value) =>
                      activeFormik.setFieldValue("client", value)
                    }
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label="Cliente"
                    value={invoiceClientName}
                    disabled
                    sx={readableDisabledFieldSx}
                  />
                )}
              </Box>

              <Box sx={{ minWidth: { md: 220 } }}>
                <DatePicker
                  label="Fecha"
                  value={parsePickerDate(activeFormik.values.date)}
                  onChange={(value) =>
                    activeFormik.setFieldValue("date", formatPickerDate(value))
                  }
                  format="DD/MM/YYYY"
                  disabled={!isEditable}
                  slotProps={{
                    field: {
                      readOnly: true,
                    },
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: !isEditable ? readableDisabledFieldSx : undefined,
                    },
                  }}
                />
              </Box>
            </Stack>

            <Divider />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Productos
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<AddRounded />}
                onClick={isEditable ? handleAddRow : undefined}
                disabled={!isEditable || isProductsLoading}
                tabIndex={isEditable ? 0 : -1}
                aria-hidden={!isEditable}
                sx={{
                  visibility: isEditable ? "visible" : "hidden",
                  pointerEvents: isEditable ? "auto" : "none",
                }}
              >
                Agregar producto
              </Button>
            </Stack>

            <ProductsTable
              rows={tableRows}
              editable={isEditable}
              productOptions={productOptions}
              onRowChange={handleRowChange}
              onRemoveRow={handleRemoveRow}
              canRemoveRow={() => activeFormik.values.rows.length > 1}
            />
          </Stack>

          <Box
            component="aside"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
              position: "relative",
              zIndex: 1,
              minHeight: 0,
              minWidth: 0,
              backgroundColor: "background.paper",
              borderLeft: { lg: "1px solid #E5E7EB" },
              borderTop: { xs: "1px solid #E5E7EB", lg: 0 },
              pl: { xs: 0, lg: 2.25 },
              pt: { xs: 2.5, lg: 0 },
              gap: { xs: 2.5, lg: 2 },
            }}
          >
            <Stack spacing={2}>
              <TextField
                size="small"
                fullWidth
                label="Descuento factura (%)"
                type="number"
                value={activeFormik.values.discount}
                onChange={(e) =>
                  activeFormik.setFieldValue(
                    "discount",
                    clampDiscount(Number(e.target.value || 0)),
                  )
                }
                inputProps={{ min: 0, max: 100, step: "0.01" }}
                disabled={!isEditable}
                sx={!isEditable ? readableDisabledFieldSx : undefined}
              />

              <InvoiceTotalsSummary
                subtotal={summarySubtotal}
                discountPercent={activeFormik.values.discount}
                total={summaryTotal}
              />
            </Stack>

            {isNewMode && (
              <Stack
                spacing={1}
                sx={{
                  mt: { xs: 1, lg: "auto" },
                  width: "100%",
                }}
              >
                <Button
                  size="small"
                  variant="contained"
                  color="info"
                  startIcon={<SaveRounded />}
                  onClick={handleCreateDraft}
                  loading={isCreating}
                  disabled={!canCreate || isCreating}
                  sx={{ width: "100%" }}
                >
                  Guardar borrador
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<AddRounded />}
                  onClick={handleCreateInvoice}
                  loading={isCreating}
                  disabled={!canCreate || isCreating}
                  sx={{ width: "100%" }}
                >
                  Crear factura
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </EntityFormContainer>
    </LocalizationProvider>
  );
}
