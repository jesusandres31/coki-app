import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";
import {
  AddRounded,
  CancelRounded,
  ChevronLeftRounded,
  DeleteRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  amount: 1,
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
    color: theme.palette.text.secondary,
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
        flex: "1 1 auto",
        minHeight: 0,
        overflowY: "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
      }}
    >
      <Table size="small" stickyHeader>
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
                  value={row.amount}
                  onChange={(e) =>
                    onRowChange?.(
                      row.id,
                      "amount",
                      Math.max(1, Number(e.target.value || 1)),
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
  return (
    <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
      <Typography variant="body2" color="text.secondary">
        Subtotal: {formatMoney(subtotal)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Descuento factura: {formatPercent(discountPercent)}
      </Typography>
      <Typography variant="h6" fontWeight={700}>
        Total: {formatMoney(total)}
      </Typography>
    </Stack>
  );
}

export default function InvoiceFormPage() {
  const { invoiceId } = useParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();

  const isDetailRoute = Boolean(invoiceId);
  const [mode, setMode] = useState<InvoicePageMode>(
    isDetailRoute ? "review" : "new",
  );

  useEffect(() => {
    setMode(isDetailRoute ? "review" : "new");
  }, [isDetailRoute]);

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
        setMode("review");
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
        label: "Reabrir factura",
        color: "success" as const,
      };
    }

    if (currentInvoiceState === "draft") {
      return {
        nextState: "open" as InvoiceState,
        label: "Abrir factura",
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

  const parsedClient = parseJsonValue<{
    id?: string;
    name?: string;
  }>(invoice?.client);
  const invoiceClientName =
    parsedClient?.name ||
    (typeof invoice?.client === "string" ? invoice.client : "-");

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
    setMode("review");
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

  if (isDetailRoute && isFetching) {
    return (
      <PageContainer>
        <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
          <Loading />
        </Container>
      </PageContainer>
    );
  }

  if (isDetailRoute && (error || !invoice)) {
    return (
      <PageContainer>
        <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
          <ErrorMsg />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container
          component="main"
          maxWidth="lg"
          sx={{
            py: { xs: 2, md: 3 },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              {isNewMode ? "Crear factura" : `Factura "${invoice?.id || ""}"`}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {!isNewMode &&
                (isEditMode ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SaveRounded />}
                      onClick={() => void editFormik.submitForm()}
                      loading={isUpdating}
                    >
                      Guardar
                    </Button>
                    <Button
                      color="secondary"
                      size="small"
                      variant="outlined"
                      startIcon={<CancelRounded />}
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancelar edición
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditRounded />}
                      color="info"
                      onClick={() => setMode("edit")}
                    >
                      Editar
                    </Button>
                    {stateActionConfig && (
                      <Button
                        size="small"
                        variant="outlined"
                        color={stateActionConfig.color}
                        onClick={() =>
                          void handleUpdateState(stateActionConfig.nextState)
                        }
                        loading={isUpdating}
                      >
                        {stateActionConfig.label}
                      </Button>
                    )}
                  </>
                ))}
              <Button
                color="secondary"
                size="small"
                variant="outlined"
                startIcon={<ChevronLeftRounded />}
                onClick={() => handleGoTo(AppRoutes.Invoices)}
              >
                Atrás
              </Button>
            </Stack>
          </Stack>

          <Card
            variant="outlined"
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
              overflow: "hidden",
              borderRadius: 3,
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, md: 3 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <Stack spacing={2.5} sx={{ flex: "1 1 auto", minHeight: 0 }}>
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

                  <Box sx={{ minWidth: { md: 220 } }}>
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
                    variant="outlined"
                    color="secondary"
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

                <Divider />

                <Box
                  sx={{
                    mt: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <InvoiceTotalsSummary
                    subtotal={summarySubtotal}
                    discountPercent={activeFormik.values.discount}
                    total={summaryTotal}
                  />

                  {isNewMode && (
                    <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={handleCreateDraft}
                        loading={isCreating}
                        disabled={!canCreate}
                      >
                        Guardar borrador
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleCreateInvoice}
                        loading={isCreating}
                        disabled={!canCreate}
                      >
                        Crear factura
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </LocalizationProvider>
    </PageContainer>
  );
}
