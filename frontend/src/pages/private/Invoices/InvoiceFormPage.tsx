import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, Ref, RefObject } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";
import type { FormikErrors, FormikTouched } from "formik";
import { NumericFormat } from "react-number-format";
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  PrintRounded,
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
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Theme } from "@mui/material/styles";
import { useAppDispatch } from "src/app/store";
import {
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetConfigQuery,
  useGetClientsQuery,
  useGetInvoiceProductsByInvoiceIdQuery,
  useGetInvoiceViewByIdQuery,
  useGetMeasureUnitsQuery,
  useGetProductsQuery,
  useLazyGetLastProductPriceForClientQuery,
  useUpdateProductMutation,
  useUpdateInvoiceMutation,
} from "src/app/services/invoiceService";
import { ErrorMsg, Loading } from "src/components/common";
import EntityFormContainer from "src/components/common/Forms/EntityFormContainer";
import { withLoadingInputProps } from "src/components/common/Inputs/loadingInputProps";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { SEARCH } from "src/constants";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { formatMoney, formatPercent, MoneyValue } from "src/utils/format";
import {
  buildMeasureUnitNameById,
  isKgMeasureUnitName,
} from "src/utils/measureUnits";
import {
  buildSessionStorageKey,
  parseSessionStorageJson,
  useSessionStorageDraft,
} from "src/utils/sessionStorageDraft";
import { invoiceBreadcrumbFlow } from "./breadcrumbFlow";
import {
  buildInvoicePdfModel,
  openInvoicePdfInViewer,
  openInvoicePdfTab,
} from "./pdf";
import { getShortInvoiceId } from "src/components/common/pdf";
import ProductCatalogPriceDialog, {
  ProductCatalogPriceDialogProduct,
} from "./components/ProductCatalogPriceDialog";

type InvoicePageMode = "new" | "review" | "edit";
type InvoicePaymentMode = "none" | "full" | "partial";
type InvoiceAmountInput = number | "";
type InvoicePriceInput = number | "";
type InvoiceConfirmationAction = "create" | "update";

interface InvoiceProductInput {
  id: string;
  product: string;
  amount: InvoiceAmountInput;
  unitPrice: InvoicePriceInput;
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
  price?: number;
  measureUnitName?: string;
}

interface DebouncedAutocompleteProps {
  options: NamedOption[];
  valueId: string;
  onChange: (valueId: string) => void;
  label?: string;
  placeholder?: string;
  variant?: "outlined" | "standard";
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  helperTextNoWrap?: boolean;
  prioritizeStartsWith?: boolean;
  selectBestMatchOnBlur?: boolean;
  loading?: boolean;
}

interface ProductTableRowData {
  id: string;
  productId: string;
  productName: string;
  measureUnitName: string;
  amount: InvoiceAmountInput;
  unitPrice: InvoicePriceInput;
  catalogUnitPrice?: number;
  discount: number;
  total: number;
}

interface ProductsTableProps {
  rows: ProductTableRowData[];
  editable: boolean;
  inputsDisabled?: boolean;
  rowErrors?: InvoiceProductRowErrors[];
  productOptions: NamedOption[];
  productsLoading?: boolean;
  showCatalogPriceHint?: boolean;
  priceLoadingRowIds?: Set<string>;
  addProductButtonRef?: RefObject<HTMLButtonElement>;
  focusRowId?: string;
  onRowChange?: (
    id: string,
    field: keyof Omit<InvoiceProductInput, "id">,
    value: string | number,
  ) => void;
  onEditRow?: (id: string) => void;
  onFocusRow?: () => void;
  onRemoveRow?: (id: string) => void;
  onEditCatalogPrice?: (
    product: ProductCatalogPriceDialogProduct & { rowId: string },
  ) => void;
  canRemoveRow?: (id: string) => boolean;
}

interface InvoiceTotalsSummaryProps {
  subtotal: number;
  discountPercent: number;
  total: number;
  disabled?: boolean;
  onDiscountChange?: (discount: number) => void;
}

interface ClientBalanceSummaryProps {
  currentBalance: number;
  invoiceTotal: number;
  paymentMode: InvoicePaymentMode;
  partialPaymentAmount: number;
  disabled?: boolean;
  onPaymentModeChange: (mode: InvoicePaymentMode) => void;
  onPartialPaymentAmountChange: (amount: number) => void;
}

interface InvoiceFormValues {
  client: string;
  date: string;
  discount: number;
  paymentMode: InvoicePaymentMode;
  partialPaymentAmount: number;
  rows: InvoiceProductInput[];
}

type InvoiceProductRowErrors = Partial<
  Record<keyof Omit<InvoiceProductInput, "id">, string>
>;

type ProductTableEditableField =
  | "product"
  | "amount"
  | "unitPrice"
  | "discount";

const productTableEditableFields: ProductTableEditableField[] = [
  "product",
  "amount",
  "unitPrice",
  "discount",
];

const invoiceProductsActionColumnWidth = 56;
const invoiceProductsEditableActionColumnWidth = 88;
const invoiceProductsTotalColumnWidth = 112;
const invoiceDecimalScale = 3;
const invoiceDecimalStep = "0.001";
const invoiceDraftStoragePrefix = "coki:invoice-draft";

const invoiceProductsTotalColumnSx = {
  width: invoiceProductsTotalColumnWidth,
  minWidth: invoiceProductsTotalColumnWidth,
  maxWidth: invoiceProductsTotalColumnWidth,
  boxSizing: "border-box",
};

const invoiceProductsActionColumnSx = {
  position: "sticky",
  right: 0,
  boxSizing: "border-box",
};
const productRowHelperTextMinHeight = 14;
const productRowHelperTextSx = {
  minHeight: productRowHelperTextMinHeight,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: `${productRowHelperTextMinHeight}px`,
  fontSize: "0.68rem",
  mt: 0.125,
};
const productRowHelperTextProps = {
  sx: productRowHelperTextSx,
};

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
    Number(item.amount || 0) *
      Number(item.unitPrice || 0) *
      (1 - Math.max(0, Math.min(100, item.discount)) / 100),
  );

const clampInvoiceDecimalPlaces = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** invoiceDecimalScale;
  return Math.trunc((value + Number.EPSILON) * factor) / factor;
};

const clampDiscount = (value: number) =>
  Math.min(100, Math.max(0, clampInvoiceDecimalPlaces(value)));

const normalizeInvoiceDecimalInput = (value: string) =>
  clampInvoiceDecimalPlaces(Math.max(0, Number(value || 0)));

const normalizeOptionalInvoiceDecimalInput = (value: string) =>
  value === "" ? "" : normalizeInvoiceDecimalInput(value);

const hasInvalidInvoiceRows = (rows: InvoiceProductInput[]) =>
  rows.some(
    (row) =>
      !row.product ||
      row.amount === "" ||
      row.amount < 0 ||
      row.unitPrice === "" ||
      row.unitPrice < 0 ||
      row.discount < 0 ||
      row.discount > 100,
  );

const isCompleteInvoiceRow = (row: InvoiceProductInput | undefined) =>
  Boolean(row) &&
  Boolean(row?.product) &&
  row?.amount !== "" &&
  Number(row?.amount || 0) >= 0 &&
  row?.unitPrice !== "" &&
  Number(row?.unitPrice || 0) >= 0 &&
  Number(row?.discount || 0) >= 0 &&
  Number(row?.discount || 0) <= 100;

const validateInvoiceForm = (values: InvoiceFormValues) => {
  const errors: FormikErrors<InvoiceFormValues> = {};

  if (!values.client) {
    errors.client = "Seleccioná un cliente.";
  }

  if (!normalizeIsoDate(values.date)) {
    errors.date = "Seleccioná una fecha válida.";
  }

  const rowErrors = values.rows.map<InvoiceProductRowErrors>((row) => {
    const errors: InvoiceProductRowErrors = {};

    if (!row.product) {
      errors.product = "Seleccioná un producto.";
    }

    if (row.amount === "") {
      errors.amount = "Ingresá cantidad.";
    } else if (row.amount < 0) {
      errors.amount = "Cantidad inválida.";
    }

    if (row.unitPrice === "") {
      errors.unitPrice = "Ingresá precio.";
    } else if (row.unitPrice < 0) {
      errors.unitPrice = "Precio inválido.";
    }

    if (row.discount < 0 || row.discount > 100) {
      errors.discount = "Descuento inválido.";
    }

    return errors;
  });

  if (rowErrors.some((rowError) => Object.keys(rowError).length > 0)) {
    errors.rows = rowErrors as FormikErrors<InvoiceProductInput>[];
  }

  return errors;
};

const getPaymentPayload = (values: InvoiceFormValues, invoiceTotal: number) => {
  if (values.paymentMode === "partial") {
    const paidAmount = Math.min(
      invoiceTotal,
      Math.max(0, Number(values.partialPaymentAmount || 0)),
    );

    return {
      paidNow: paidAmount >= invoiceTotal && invoiceTotal > 0,
      paidAmount,
    };
  }

  return { paidNow: false, paidAmount: 0 };
};

const getPaymentValidationMessage = (
  values: InvoiceFormValues,
  invoiceTotal: number,
) => {
  if (values.paymentMode !== "partial") return "";

  const paymentAmount = Number(values.partialPaymentAmount || 0);

  if (paymentAmount <= 0) return "Ingresá el importe entregado por el cliente.";

  return "";
};

const hasInvoiceFormErrors = (errors: FormikErrors<InvoiceFormValues>) =>
  Object.keys(errors).length > 0;

const buildInvoiceFormTouched = (
  values: InvoiceFormValues,
): FormikTouched<InvoiceFormValues> => ({
  client: true,
  date: true,
  discount: true,
  paymentMode: true,
  partialPaymentAmount: true,
  rows: values.rows.map(() => ({
    product: true,
    amount: true,
    unitPrice: true,
    discount: true,
  })),
});

const getInvoiceRowErrors = (errors: FormikErrors<InvoiceFormValues>) =>
  Array.isArray(errors.rows) ? (errors.rows as InvoiceProductRowErrors[]) : [];

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
  return parseSessionStorageJson<T>(value);
};

const buildInvoiceFormValuesFromInvoice = (invoice: {
  client?: unknown;
  date?: unknown;
  discount?: unknown;
  invoice_products?: unknown;
}): InvoiceFormValues => {
  const parsedClient = parseJsonValue<{ id?: string; name?: string }>(
    invoice.client,
  );

  const rawInvoiceProducts =
    parseJsonValue<InvoiceProductRow[]>(invoice.invoice_products) || [];

  const rows =
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
          amount: Math.max(0, Number(item.amount ?? 0)),
          unitPrice: Math.max(0, Number(item.unit_price ?? 0)),
          discount: Math.min(100, Math.max(0, Number(item.discount ?? 0))),
        }))
      : [buildEmptyRow()];

  return {
    client: parsedClient?.id || "",
    date: String(invoice.date || "").slice(0, 10),
    discount: Number(invoice.discount ?? 0),
    paymentMode: "none",
    partialPaymentAmount: 0,
    rows,
  };
};

const extractApiMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
};

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getSearchMatchRank = (optionName: string, query: string) => {
  const normalizedName = normalizeSearchValue(optionName);
  if (normalizedName.startsWith(query)) return 0;
  if (normalizedName.includes(query)) return 1;
  return 2;
};

function DebouncedAutocomplete({
  options,
  valueId,
  onChange,
  label,
  placeholder,
  variant = "outlined",
  disabled = false,
  inputRef,
  onKeyDown,
  error = false,
  helperText,
  helperTextNoWrap = false,
  prioritizeStartsWith = false,
  selectBestMatchOnBlur = false,
  loading = false,
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
    const query = normalizeSearchValue(debouncedInputValue);
    if (!query) return options;

    const matches = options.filter((option) =>
      normalizeSearchValue(option.name).includes(query),
    );

    if (!prioritizeStartsWith) return matches;

    return [...matches].sort((a, b) => {
      const rankA = getSearchMatchRank(a.name, query);
      const rankB = getSearchMatchRank(b.name, query);

      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
  }, [debouncedInputValue, options, prioritizeStartsWith]);

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={filteredOptions}
      value={selectedOption}
      inputValue={inputValue}
      disabled={disabled}
      openOnFocus
      autoHighlight={selectBestMatchOnBlur}
      autoSelect={selectBestMatchOnBlur}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => option.id}
      onInputChange={(_event, value) => setInputValue(value)}
      onChange={(_event, value) => onChange(value?.id || "")}
      loading={loading}
      loadingText="Cargando..."
      noOptionsText="Sin resultados"
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const secondaryParts = [
          option.measureUnitName,
          option.price !== undefined ? formatMoney(option.price) : "",
        ].filter(Boolean);

        return (
          <Box
            key={key}
            component="li"
            {...optionProps}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {option.name}
            </Typography>
            {secondaryParts.length > 0 && (
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{
                  flex: "0 0 auto",
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                }}
              >
                [{secondaryParts.join(" · ")}]
              </Typography>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          variant={variant}
          label={label}
          placeholder={placeholder}
          inputRef={inputRef}
          onKeyDown={onKeyDown}
          error={error}
          helperText={helperTextNoWrap ? helperText || " " : helperText}
          FormHelperTextProps={
            helperTextNoWrap ? productRowHelperTextProps : undefined
          }
          InputProps={withLoadingInputProps(params.InputProps, loading)}
        />
      )}
    />
  );
}

function ProductsTable({
  rows,
  editable,
  inputsDisabled = false,
  rowErrors = [],
  productOptions,
  productsLoading = false,
  showCatalogPriceHint = false,
  priceLoadingRowIds = new Set<string>(),
  addProductButtonRef,
  focusRowId = "",
  onRowChange,
  onEditRow,
  onFocusRow,
  onRemoveRow,
  onEditCatalogPrice,
  canRemoveRow,
}: ProductsTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef(new Map<string, HTMLElement>());
  const previousRowsLengthRef = useRef(rows.length);
  const [amountDecimalRowIds, setAmountDecimalRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const controlsDisabled = !editable || inputsDisabled;
  const bodyCellSx = {
    py: 0.5,
    verticalAlign: "middle",
  };
  const editableBodyCellSx = {
    ...bodyCellSx,
    verticalAlign: editable ? "top" : "middle",
  };
  const priceCellSx = {
    ...editableBodyCellSx,
  };
  const totalCellSx = {
    ...invoiceProductsTotalColumnSx,
    ...editableBodyCellSx,
  };
  const totalValueSx = {
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
  const rowActionButtonSx = {
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const rowHelperSpacerSx = {
    minHeight: productRowHelperTextMinHeight,
    mt: 0.125,
  };
  const singleLineHelperTextProps = productRowHelperTextProps;
  const showActionColumn = editable;
  const actionColumnWidth =
    editable && onEditRow
      ? invoiceProductsEditableActionColumnWidth
      : invoiceProductsActionColumnWidth;
  const actionColumnSx = {
    ...invoiceProductsActionColumnSx,
    width: actionColumnWidth,
    minWidth: actionColumnWidth,
    maxWidth: actionColumnWidth,
  };
  const getFieldKey = (rowId: string, field: ProductTableEditableField) =>
    `${rowId}:${field}`;
  const setFieldRef =
    (rowId: string, field: ProductTableEditableField) =>
    (element: HTMLElement | null) => {
      const key = getFieldKey(rowId, field);

      if (element) {
        fieldRefs.current.set(key, element);
        return;
      }

      fieldRefs.current.delete(key);
    };
  const scrollFieldIntoView = (
    rowId: string,
    field: ProductTableEditableField,
  ) => {
    const container = tableContainerRef.current;
    const element = fieldRefs.current.get(getFieldKey(rowId, field));
    if (!container || !element) return;

    const target = element.closest("tr") || element;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const topPadding = 48;
    const bottomPadding = 12;

    if (targetRect.top < containerRect.top + topPadding) {
      container.scrollBy({
        top: targetRect.top - containerRect.top - topPadding,
        behavior: "smooth",
      });
      return;
    }

    if (targetRect.bottom > containerRect.bottom - bottomPadding) {
      container.scrollBy({
        top: targetRect.bottom - containerRect.bottom + bottomPadding,
        behavior: "smooth",
      });
    }
  };
  const focusField = (rowIndex: number, fieldIndex: number) => {
    const targetRow = rows[rowIndex];
    const targetField = productTableEditableFields[fieldIndex];
    if (!targetRow || !targetField) return;

    const element = fieldRefs.current.get(
      getFieldKey(targetRow.id, targetField),
    );
    if (!element) return;

    scrollFieldIntoView(targetRow.id, targetField);

    if (element instanceof HTMLInputElement) {
      element.focus({ preventScroll: true });
      if (targetField === "product") {
        element.click();
      }
      element.select();
      return;
    }

    element.focus();
  };
  const focusAddProductButton = () => {
    addProductButtonRef?.current?.focus();
  };
  const updateAmountDecimalIntent = (rowId: string, shouldShow: boolean) => {
    setAmountDecimalRowIds((current) => {
      const next = new Set(current);
      if (shouldShow) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  };
  const focusNextField = (rowIndex: number, fieldIndex: number) => {
    if (fieldIndex < productTableEditableFields.length - 1) {
      focusField(rowIndex, fieldIndex + 1);
      return;
    }

    focusAddProductButton();
  };
  const handleFieldKeyDown =
    (rowIndex: number, field: ProductTableEditableField) =>
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (controlsDisabled) return;

      const fieldIndex = productTableEditableFields.indexOf(field);

      if (event.key === "Tab" && !event.shiftKey && field === "discount") {
        event.preventDefault();
        focusAddProductButton();
        return;
      }

      if (
        field === "product" &&
        ["ArrowUp", "ArrowDown", "Enter"].includes(event.key)
      ) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        focusNextField(rowIndex, fieldIndex);
        return;
      }

      if (event.key === "Delete" && event.ctrlKey) {
        event.preventDefault();
        if (canRemoveRow?.(rows[rowIndex]?.id || "")) {
          onRemoveRow?.(rows[rowIndex].id);
          requestAnimationFrame(() =>
            focusField(Math.max(0, rowIndex - 1), fieldIndex),
          );
        }
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusField(
          rowIndex,
          Math.min(fieldIndex + 1, productTableEditableFields.length - 1),
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusField(rowIndex, Math.max(fieldIndex - 1, 0));
        return;
      }

      if (field === "product") return;

      if (field === "amount" && [",", "."].includes(event.key)) {
        updateAmountDecimalIntent(rows[rowIndex]?.id || "", true);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusField(Math.min(rowIndex + 1, rows.length - 1), fieldIndex);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusField(Math.max(rowIndex - 1, 0), fieldIndex);
      }
    };

  useEffect(() => {
    const previousRowsLength = previousRowsLengthRef.current;
    previousRowsLengthRef.current = rows.length;

    if (!editable || inputsDisabled || rows.length <= previousRowsLength) {
      return;
    }

    requestAnimationFrame(() => {
      focusField(rows.length - 1, 0);
      requestAnimationFrame(() => {
        focusField(rows.length - 1, 0);
        window.setTimeout(() => focusField(rows.length - 1, 0), 0);
      });
    });
  }, [editable, inputsDisabled, rows.length]);

  useEffect(() => {
    if (!focusRowId || !editable || inputsDisabled) return;

    const rowIndex = rows.findIndex((row) => row.id === focusRowId);
    if (rowIndex < 0) return;

    requestAnimationFrame(() => {
      focusField(rowIndex, 0);
      onFocusRow?.();
    });
  }, [editable, focusRowId, inputsDisabled, rows, onFocusRow]);

  return (
    <TableContainer
      ref={tableContainerRef}
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
      <Table
        size="small"
        stickyHeader
        sx={{
          minWidth: editable ? 860 : 800,
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "35%" }}>Producto</TableCell>
            <TableCell sx={{ width: "10%" }}>Cantidad</TableCell>
            <TableCell sx={{ width: "7%" }}>Unidad</TableCell>
            <TableCell sx={{ width: "16%" }}>Precio unit.</TableCell>
            <TableCell sx={{ width: "12%" }}>Descuento</TableCell>
            <TableCell
              align="right"
              sx={{
                ...invoiceProductsTotalColumnSx,
                backgroundColor: "#F8FAFC",
              }}
            >
              Total
            </TableCell>
            {showActionColumn && (
              <TableCell
                align="center"
                sx={{
                  ...actionColumnSx,
                  zIndex: 4,
                  backgroundColor: "#F8FAFC",
                }}
              >
                Acc.
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => {
            const rowError = rowErrors[rowIndex] || {};
            const isPriceLoading = priceLoadingRowIds.has(row.id);
            const isKgUnit = isKgMeasureUnitName(row.measureUnitName);
            const canEditCatalogPrice =
              editable && Boolean(row.productId) && Boolean(onEditCatalogPrice);
            const shouldShowAmountDecimals =
              isKgUnit ||
              amountDecimalRowIds.has(row.id) ||
              (row.amount !== "" && !Number.isInteger(row.amount));

            return (
              <TableRow key={row.id}>
                <TableCell sx={editableBodyCellSx}>
                  {editable ? (
                    <DebouncedAutocomplete
                      options={productOptions}
                      valueId={row.productId}
                      placeholder="Seleccionar producto"
                      prioritizeStartsWith
                      selectBestMatchOnBlur
                      variant="standard"
                      disabled={inputsDisabled}
                      loading={productsLoading}
                      inputRef={setFieldRef(row.id, "product")}
                      onKeyDown={handleFieldKeyDown(rowIndex, "product")}
                      error={Boolean(rowError.product)}
                      helperText={rowError.product}
                      helperTextNoWrap
                      onChange={(value) => {
                        onRowChange?.(row.id, "product", value);
                        requestAnimationFrame(() => focusField(rowIndex, 1));
                      }}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      value={row.productName}
                      disabled
                      helperText=" "
                      FormHelperTextProps={singleLineHelperTextProps}
                      sx={readableDisabledFieldSx}
                    />
                  )}
                </TableCell>

                <TableCell sx={editableBodyCellSx}>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    size="small"
                    variant="standard"
                    value={row.amount}
                    valueIsNumericString
                    decimalSeparator=","
                    thousandSeparator="."
                    allowedDecimalSeparators={[",", "."]}
                    decimalScale={invoiceDecimalScale}
                    fixedDecimalScale={shouldShowAmountDecimals}
                    allowNegative={false}
                    onValueChange={(values) => {
                      const amount =
                        values.value === "" ? "" : (values.floatValue ?? 0);
                      onRowChange?.(row.id, "amount", amount);
                      if (isKgUnit) return;

                      updateAmountDecimalIntent(
                        row.id,
                        values.formattedValue.includes(",") ||
                          (amount !== "" && !Number.isInteger(amount)),
                      );
                    }}
                    inputProps={{ inputMode: "decimal" }}
                    getInputRef={setFieldRef(row.id, "amount")}
                    onKeyDown={handleFieldKeyDown(rowIndex, "amount")}
                    disabled={controlsDisabled}
                    error={Boolean(rowError.amount)}
                    helperText={rowError.amount || " "}
                    FormHelperTextProps={singleLineHelperTextProps}
                    sx={readableDisabledFieldSx}
                  />
                </TableCell>

                <TableCell sx={editableBodyCellSx}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    value={row.measureUnitName}
                    disabled
                    helperText=" "
                    FormHelperTextProps={singleLineHelperTextProps}
                    sx={readableDisabledFieldSx}
                  />
                </TableCell>

                <TableCell sx={priceCellSx}>
                  <Box>
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      size="small"
                      variant="standard"
                      value={row.unitPrice}
                      valueIsNumericString
                      decimalSeparator=","
                      thousandSeparator="."
                      allowedDecimalSeparators={[",", "."]}
                      decimalScale={invoiceDecimalScale}
                      allowNegative={false}
                      onValueChange={(values) =>
                        onRowChange?.(
                          row.id,
                          "unitPrice",
                          normalizeOptionalInvoiceDecimalInput(values.value),
                        )
                      }
                      inputProps={{ min: 0, step: invoiceDecimalStep }}
                      InputProps={withLoadingInputProps(
                        {
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{
                                mr: 0.75,
                                minWidth: 14,
                                justifyContent: "center",
                              }}
                            >
                              $
                            </InputAdornment>
                          ),
                        },
                        isPriceLoading,
                      )}
                      getInputRef={setFieldRef(row.id, "unitPrice")}
                      onKeyDown={handleFieldKeyDown(rowIndex, "unitPrice")}
                      disabled={controlsDisabled || isPriceLoading}
                      error={Boolean(rowError.unitPrice)}
                      helperText={
                        rowError.unitPrice ||
                        (editable && showCatalogPriceHint && row.productId ? (
                          <Tooltip title="Editar precio general">
                            <Typography
                              component="button"
                              type="button"
                              variant="caption"
                              onClick={() => {
                                if (!canEditCatalogPrice) return;

                                onEditCatalogPrice?.({
                                  id: row.productId,
                                  rowId: row.id,
                                  name: row.productName,
                                  measureUnitName: row.measureUnitName,
                                  unitPrice: row.catalogUnitPrice ?? 0,
                                });
                              }}
                              sx={{
                                appearance: "none",
                                border: 0,
                                background: "transparent",
                                color: "text.secondary",
                                cursor: canEditCatalogPrice
                                  ? "pointer"
                                  : "default",
                                font: "inherit",
                                lineHeight: "inherit",
                                m: 0,
                                p: 0,
                                textAlign: "left",
                                "&:hover": canEditCatalogPrice
                                  ? {
                                      color: "primary.main",
                                      textDecoration: "underline",
                                    }
                                  : undefined,
                              }}
                            >
                              {`Precio Gral.: ${formatMoney(row.catalogUnitPrice ?? 0)}`}
                            </Typography>
                          </Tooltip>
                        ) : (
                          " "
                        ))
                      }
                      FormHelperTextProps={singleLineHelperTextProps}
                      sx={(theme) => ({
                        ...readableDisabledFieldSx(theme),
                        "& .MuiInputBase-input": {
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                        },
                      })}
                    />
                  </Box>
                </TableCell>

                <TableCell sx={editableBodyCellSx}>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    size="small"
                    variant="standard"
                    value={row.discount}
                    valueIsNumericString
                    decimalSeparator=","
                    thousandSeparator="."
                    allowedDecimalSeparators={[",", "."]}
                    decimalScale={invoiceDecimalScale}
                    allowNegative={false}
                    onValueChange={(values) =>
                      onRowChange?.(
                        row.id,
                        "discount",
                        clampDiscount(Number(values.value || 0)),
                      )
                    }
                    inputProps={{ min: 0, max: 100, step: invoiceDecimalStep }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    getInputRef={setFieldRef(row.id, "discount")}
                    onKeyDown={handleFieldKeyDown(rowIndex, "discount")}
                    disabled={controlsDisabled}
                    error={Boolean(rowError.discount)}
                    helperText={rowError.discount || " "}
                    FormHelperTextProps={singleLineHelperTextProps}
                    sx={readableDisabledFieldSx}
                  />
                </TableCell>

                <TableCell align="right" sx={totalCellSx}>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={totalValueSx}
                    >
                      <MoneyValue value={row.total} />
                    </Typography>
                    <Box sx={rowHelperSpacerSx} />
                  </Box>
                </TableCell>

                {showActionColumn && (
                  <TableCell
                    align="center"
                    sx={{
                      ...actionColumnSx,
                      ...editableBodyCellSx,
                      zIndex: 2,
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box>
                      <Box sx={{ ...rowActionButtonSx, gap: 0.5 }}>
                        {onEditRow && (
                          <Tooltip title="Editar producto">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEditRow(row.id)}
                                disabled={inputsDisabled && editable}
                                sx={{
                                  width: 30,
                                  height: 30,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 1.25,
                                  p: 0.5,
                                }}
                                aria-label="Editar producto"
                              >
                                <EditRounded />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {editable && (
                          <Tooltip title="Eliminar producto">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onRemoveRow?.(row.id)}
                                disabled={
                                  inputsDisabled || !canRemoveRow?.(row.id)
                                }
                                sx={{
                                  width: 30,
                                  height: 30,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 1.25,
                                  p: 0.5,
                                }}
                                aria-label="Eliminar producto"
                              >
                                <DeleteRounded />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                      <Box sx={rowHelperSpacerSx} />
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function InvoiceTotalsSummary({
  subtotal,
  discountPercent,
  total,
  disabled = false,
  onDiscountChange,
}: InvoiceTotalsSummaryProps) {
  return (
    <Stack spacing={1.25} sx={{ width: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Typography variant="body2" color="text.secondary">
          Subtotal:
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {formatMoney(subtotal)}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="stretch"
        alignItems="flex-start"
        spacing={1}
      >
        <NumericFormat
          customInput={TextField}
          variant="standard"
          fullWidth
          label="Descuento factura"
          value={discountPercent}
          valueIsNumericString
          decimalSeparator=","
          thousandSeparator="."
          allowedDecimalSeparators={[",", "."]}
          decimalScale={invoiceDecimalScale}
          allowNegative={false}
          onValueChange={(values) =>
            onDiscountChange?.(clampDiscount(Number(values.value || 0)))
          }
          disabled={disabled}
          inputProps={{ min: 0, max: 100, step: invoiceDecimalStep }}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          sx={{
            "& input": {
              textAlign: "right",
              fontWeight: 600,
            },
          }}
        />
      </Stack>
      <Divider />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        spacing={1}
      >
        <Typography
          variant="h6"
          color="text.primary"
          fontWeight={700}
          sx={{ fontSize: "1.30rem" }}
        >
          Total
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          textAlign="left"
          sx={{ fontSize: "1.30rem" }}
        >
          {formatMoney(total)}
        </Typography>
      </Stack>
    </Stack>
  );
}

function ClientBalanceSummary({
  currentBalance,
  invoiceTotal,
  paymentMode,
  partialPaymentAmount,
  disabled = false,
  onPaymentModeChange,
  onPartialPaymentAmountChange,
}: ClientBalanceSummaryProps) {
  const normalizedPartialPaymentAmount = Math.max(0, partialPaymentAmount);
  const paidAmount =
    paymentMode === "partial"
      ? Math.min(invoiceTotal, normalizedPartialPaymentAmount)
      : 0;
  const resultingBalance = currentBalance + invoiceTotal - paidAmount;
  const hasPayment = paymentMode === "partial";

  return (
    <Stack
      spacing={1.5}
      sx={{
        width: "100%",
        borderTop: "1px solid #EEF0F3",
        pt: 1.5,
        color: "text.secondary",
      }}
    >
      <FormControlLabel
        sx={{}}
        control={
          <Checkbox
            size="small"
            checked={hasPayment}
            onChange={(event) =>
              onPaymentModeChange(event.target.checked ? "partial" : "none")
            }
            disabled={disabled || invoiceTotal <= 0}
          />
        }
        label="Registrar pago"
      />
      {hasPayment && (
        <NumericFormat
          customInput={TextField}
          variant="standard"
          size="small"
          fullWidth
          label="Importe entregado"
          value={partialPaymentAmount || ""}
          valueIsNumericString
          decimalSeparator=","
          thousandSeparator="."
          allowedDecimalSeparators={[",", "."]}
          decimalScale={invoiceDecimalScale}
          allowNegative={false}
          onValueChange={(values) =>
            onPartialPaymentAmountChange(
              normalizeInvoiceDecimalInput(values.value),
            )
          }
          inputProps={{ min: 0, step: invoiceDecimalStep }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ mr: 0.75, minWidth: 14, justifyContent: "center" }}
              >
                $
              </InputAdornment>
            ),
          }}
          disabled={disabled}
        />
      )}

      <Stack spacing={1} sx={{ pt: 1.5 }}>
        {[
          { label: "Saldo actual", value: formatMoney(currentBalance) },
          { label: "Total factura", value: formatMoney(invoiceTotal) },
          { label: "Pago aplicado", value: formatMoney(paidAmount) },
        ].map((row) => (
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
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
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
          <Typography variant="subtitle2" color="text.secondary">
            Saldo resultante
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            fontWeight={600}
          >
            {formatMoney(resultingBalance)}
          </Typography>
        </Stack>
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceConfirmationAction, setInvoiceConfirmationAction] =
    useState<InvoiceConfirmationAction | null>(null);
  const [isInvoiceDeleted, setIsInvoiceDeleted] = useState(false);
  const [catalogPriceProduct, setCatalogPriceProduct] =
    useState<(ProductCatalogPriceDialogProduct & { rowId: string }) | null>(
      null,
    );
  const [retrieveLastPriceEnabled, setRetrieveLastPriceEnabled] =
    useState(false);
  const [focusedProductRowId, setFocusedProductRowId] = useState("");
  const mobileAddProductButtonRef = useRef<HTMLButtonElement>(null);
  const desktopAddProductButtonRef = useRef<HTMLButtonElement>(null);
  const invoiceConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteInvoiceConfirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMode(isDetailRoute ? requestedDetailMode : "new");
  }, [isDetailRoute, requestedDetailMode]);

  useEffect(() => {
    if (!invoiceConfirmationAction) return;

    const frameId = requestAnimationFrame(() => {
      invoiceConfirmButtonRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [invoiceConfirmationAction]);

  useEffect(() => {
    if (!deleteDialogOpen) return;

    const frameId = requestAnimationFrame(() => {
      deleteInvoiceConfirmButtonRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [deleteDialogOpen]);

  useEffect(() => {
    setIsInvoiceDeleted(false);
  }, [invoiceId]);

  const isNewMode = mode === "new";
  const isEditMode = mode === "edit";
  const invoiceDraftKey = useMemo(() => {
    if (isNewMode) {
      return buildSessionStorageKey(invoiceDraftStoragePrefix, "new");
    }

    if (isEditMode && invoiceId) {
      return buildSessionStorageKey(
        invoiceDraftStoragePrefix,
        `edit:${invoiceId}`,
      );
    }
    return "";
  }, [invoiceId, isEditMode, isNewMode]);

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

  const { data: clients = [], isFetching: isClientsFetching } =
    useGetClientsQuery(undefined, {
      skip: !isNewMode && !isEditMode,
    });
  const { data: appConfig } = useGetConfigQuery();
  const { data: measureUnits = [] } = useGetMeasureUnitsQuery(undefined, {
    skip: !isNewMode && !isDetailRoute,
  });
  const { data: products = [], isFetching: isProductsFetching } =
    useGetProductsQuery(undefined, { skip: !isNewMode && !isDetailRoute });
  const {
    data: invoice,
    isFetching,
    error,
  } = useGetInvoiceViewByIdQuery(invoiceId || "", {
    skip: !isDetailRoute || isInvoiceDeleted,
  });
  const {
    data: activeInvoiceProducts,
    isFetching: isInvoiceProductsFetching,
    error: invoiceProductsError,
  } = useGetInvoiceProductsByInvoiceIdQuery(invoiceId || "", {
    skip: !isDetailRoute || isInvoiceDeleted,
  });

  const invoiceWithActiveProducts = useMemo(() => {
    if (!invoice || activeInvoiceProducts === undefined) return invoice;

    return {
      ...invoice,
      invoice_products: activeInvoiceProducts,
    };
  }, [activeInvoiceProducts, invoice]);

  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] =
    useUpdateProductMutation();
  const [triggerGetLastProductPriceForClient] =
    useLazyGetLastProductPriceForClientQuery();
  const [priceLoadingRowIds, setPriceLoadingRowIds] = useState<Set<string>>(
    () => new Set(),
  );
  const priceRequestKeyByRowIdRef = useRef(new Map<string, number>());
  const priceRequestSeqRef = useRef(0);
  const latestRowsRef = useRef<InvoiceProductInput[]>([]);

  useEffect(() => {
    if (!isNewMode && !isEditMode) return;

    setRetrieveLastPriceEnabled(Boolean(appConfig?.retrieve_last_price));
  }, [appConfig?.retrieve_last_price, invoiceId, isEditMode, isNewMode]);

  const clientOptions = useMemo<NamedOption[]>(
    () =>
      clients.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [clients],
  );
  const clientById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );
  const measureUnitById = useMemo(
    () => buildMeasureUnitNameById(measureUnits),
    [measureUnits],
  );

  const productOptions = useMemo<NamedOption[]>(
    () =>
      products.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.unit_price ?? 0),
        measureUnitName: measureUnitById.get(String(item.measure_unit || "")),
      })),
    [measureUnitById, products],
  );

  const newFormik = useFormik<InvoiceFormValues>({
    initialValues: {
      client: "",
      date: getLocalDate(),
      discount: 0,
      paymentMode: "none",
      partialPaymentAmount: 0,
      rows: [buildEmptyRow()],
    },
    validate: validateInvoiceForm,
    validateOnMount: true,
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
        const invoiceSubtotal = values.rows.reduce(
          (acc, row) => acc + getCreateItemTotal(row),
          0,
        );
        const invoiceTotal = Math.max(
          0,
          invoiceSubtotal * (1 - clampDiscount(values.discount) / 100),
        );
        const paymentError = getPaymentValidationMessage(values, invoiceTotal);

        if (paymentError) {
          dispatch(setSnackbar({ message: paymentError, type: "error" }));
          return;
        }

        const paymentPayload = getPaymentPayload(values, invoiceTotal);
        await createInvoice({
          client: values.client,
          date: normalizedDate,
          discount: values.discount,
          ...paymentPayload,
          state: "open",
          items: values.rows.map((row) => ({
            product: row.product,
            amount: Number(row.amount),
            unitPrice: Number(row.unitPrice),
            discount: row.discount,
          })),
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Factura creada satisfactoriamente.",
            type: "success",
          }),
        );
        setInvoiceConfirmationAction(null);
        clearActiveInvoiceDraft();
        handleGoTo(AppRoutes.Invoices);
      } catch (error) {
        dispatch(
          setSnackbar({
            message:
              extractApiMessage(error) ||
              "No se pudo crear la factura o registrar el pago.",
            type: "error",
          }),
        );
      }
    },
  });

  const editFormik = useFormik<InvoiceFormValues>({
    initialValues: {
      client: "",
      date: "",
      discount: 0,
      paymentMode: "none",
      partialPaymentAmount: 0,
      rows: [buildEmptyRow()],
    },
    validate: validateInvoiceForm,
    validateOnMount: true,
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
            id: row.id,
            product: row.product,
            amount: Number(row.amount),
            unitPrice: Number(row.unitPrice),
            discount: row.discount,
          })),
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Factura actualizada satisfactoriamente.",
            type: "success",
          }),
        );
        setInvoiceConfirmationAction(null);
        clearActiveInvoiceDraft();
        setSearchParams({ mode: "review" });
      } catch {
        // Error feedback is already handled by RTK middleware.
      }
    },
  });

  const hydrateInvoiceDraft = useCallback(
    (draft: InvoiceFormValues) => {
      if (isNewMode) {
        newFormik.setValues(draft, true);
        return;
      }

      editFormik.setValues(draft, true);
    },
    [editFormik, isNewMode, newFormik],
  );

  const getInvoiceDraftFallback = useCallback(() => {
    if (!isEditMode || !invoiceWithActiveProducts) return null;

    return buildInvoiceFormValuesFromInvoice(invoiceWithActiveProducts);
  }, [invoiceWithActiveProducts, isEditMode]);

  const { clearDraft: clearActiveInvoiceDraft } =
    useSessionStorageDraft<InvoiceFormValues>({
      key: invoiceDraftKey,
      value: isNewMode ? newFormik.values : editFormik.values,
      ready:
        isNewMode ||
        Boolean(invoiceWithActiveProducts && activeInvoiceProducts !== undefined),
      onHydrate: hydrateInvoiceDraft,
      getFallbackValue: getInvoiceDraftFallback,
    });

  useEffect(() => {
    if (!invoiceWithActiveProducts || isNewMode || isEditMode) return;

    editFormik.setValues(
      buildInvoiceFormValuesFromInvoice(invoiceWithActiveProducts),
    );
  }, [invoiceWithActiveProducts, isEditMode, isNewMode]);

  const invoiceProducts: InvoiceProductRow[] = useMemo(() => {
    const parsed = parseJsonValue<InvoiceProductRow[]>(
      invoiceWithActiveProducts?.invoice_products,
    );
    if (!parsed || !Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  }, [invoiceWithActiveProducts?.invoice_products]);

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

  const createTableRows = useMemo<ProductTableRowData[]>(
    () =>
      newFormik.values.rows.map((row) => {
        const product = productById.get(row.product);
        const productName =
          productOptions.find((option) => option.id === row.product)?.name ||
          "";
        return {
          id: row.id,
          productId: row.product,
          productName,
          measureUnitName:
            measureUnitById.get(product?.measureUnitId || "") || "-",
          amount: row.amount,
          unitPrice: row.unitPrice,
          catalogUnitPrice: product?.unitPrice ?? 0,
          discount: row.discount,
          total: getCreateItemTotal(row),
        };
      }),
    [newFormik.values.rows, productOptions, measureUnitById, productById],
  );

  const detailTableRows = useMemo<ProductTableRowData[]>(
    () =>
      editFormik.values.rows.map((row) => {
        const product = productById.get(row.product);
        const productName =
          productOptions.find((option) => option.id === row.product)?.name ||
          invoiceProducts.find((item) => item.id === row.id)?.product_name ||
          "-";

        return {
          id: row.id,
          productId: row.product,
          productName,
          measureUnitName:
            measureUnitById.get(product?.measureUnitId || "") || "-",
          amount: row.amount,
          unitPrice: row.unitPrice,
          catalogUnitPrice: product?.unitPrice ?? 0,
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
    Boolean(normalizeIsoDate(newFormik.values.date)) &&
    newFormik.values.rows.length > 0 &&
    !hasInvalidRows;

  const requestInvoiceConfirmation = async (
    action: InvoiceConfirmationAction,
  ) => {
    const formik = action === "create" ? newFormik : editFormik;
    const errors = await formik.validateForm();
    formik.setTouched(buildInvoiceFormTouched(formik.values), false);

    if (hasInvoiceFormErrors(errors)) {
      dispatch(
        setSnackbar({
          message: "Revisá los campos marcados antes de confirmar la factura.",
          type: "error",
        }),
      );
      return;
    }

    if (action === "create") {
      const invoiceSubtotal = formik.values.rows.reduce(
        (acc, row) => acc + getCreateItemTotal(row),
        0,
      );
      const invoiceTotal = Math.max(
        0,
        invoiceSubtotal * (1 - clampDiscount(formik.values.discount) / 100),
      );
      const paymentError = getPaymentValidationMessage(
        formik.values,
        invoiceTotal,
      );

      if (paymentError) {
        dispatch(setSnackbar({ message: paymentError, type: "error" }));
        return;
      }
    }

    setInvoiceConfirmationAction(action);
  };

  const handleCreateInvoice = () => {
    void requestInvoiceConfirmation("create");
  };

  const handleUpdateInvoice = () => {
    void requestInvoiceConfirmation("update");
  };

  const handleConfirmInvoiceAction = () => {
    if (invoiceConfirmationAction === "create") {
      void newFormik.submitForm();
      return;
    }

    if (invoiceConfirmationAction === "update") {
      void editFormik.submitForm();
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceId) return;

    setIsInvoiceDeleted(true);

    try {
      await deleteInvoice(invoiceId).unwrap();
      dispatch(
        setSnackbar({
          message: "Factura eliminada satisfactoriamente.",
          type: "success",
        }),
      );
      setDeleteDialogOpen(false);
      clearActiveInvoiceDraft();
      handleGoTo(AppRoutes.Invoices);
    } catch {
      setIsInvoiceDeleted(false);
      dispatch(
        setSnackbar({
          message: "No se pudo eliminar la factura.",
          type: "error",
        }),
      );
    }
  };

  const activeFormik = isNewMode ? newFormik : editFormik;
  const isEditable = isNewMode || isEditMode;

  useEffect(() => {
    latestRowsRef.current = activeFormik.values.rows;
  }, [activeFormik.values.rows]);

  const activeErrors = activeFormik.errors;
  const clientError =
    isEditable && typeof activeErrors.client === "string"
      ? activeErrors.client
      : "";
  const dateError =
    isEditable && typeof activeErrors.date === "string"
      ? activeErrors.date
      : "";
  const productRowErrors = isEditable ? getInvoiceRowErrors(activeErrors) : [];
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
  const selectedInvoiceClientId =
    activeFormik.values.client || parsedClient?.id || "";
  const selectedClient = clientById.get(selectedInvoiceClientId) || null;
  const selectedClientBalance = Number(selectedClient?.balance ?? 0);
  const hasInvoiceDate = Boolean(normalizeIsoDate(activeFormik.values.date));
  const lastInvoiceRow =
    activeFormik.values.rows[activeFormik.values.rows.length - 1];
  const canEditProducts =
    isEditable && Boolean(selectedInvoiceClientId) && hasInvoiceDate;
  const canAddProductRow =
    canEditProducts && isCompleteInvoiceRow(lastInvoiceRow);
  const pageTitle = isNewMode
    ? "Crear factura"
    : `Factura "${getShortInvoiceId(invoice?.id || "")}"`;
  const invoiceConfirmationDialog =
    invoiceConfirmationAction === "create"
      ? {
          title: "Crear factura",
          message:
            "¿Seguro que querés crear esta factura? Se registrará con los productos, descuentos y pagos configurados.",
          confirmLabel: "Crear factura",
          color: "success" as const,
          loading: isCreating,
        }
      : invoiceConfirmationAction === "update"
        ? {
            title: "Guardar cambios",
            message: `¿Seguro que querés actualizar la factura "${getShortInvoiceId(invoice?.id || "")}"? Los cambios reemplazarán los datos actuales.`,
            confirmLabel: "Guardar cambios",
            color: "success" as const,
            loading: isUpdating,
          }
        : null;

  const reviewHeaderActions =
    !isNewMode && !isEditMode ? (
      <>
        <Button
          size="small"
          variant="contained"
          color="error"
          startIcon={<DeleteRounded />}
          onClick={() => setDeleteDialogOpen(true)}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Eliminar factura
        </Button>
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
      </>
    ) : undefined;

  const retrieveLastPriceToggle = isEditable ? (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={retrieveLastPriceEnabled}
          onChange={(_, checked) => setRetrieveLastPriceEnabled(checked)}
          inputProps={{
            "aria-label":
              "Recuperar último precio de productos por cliente en esta factura",
          }}
        />
      }
      label="Recuperar último precio"
      labelPlacement="start"
      sx={{
        m: 0,
        px: { xs: 0, sm: 0.5 },
        minHeight: 30,
        "& .MuiFormControlLabel-label": {
          fontSize: 13,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        },
      }}
    />
  ) : undefined;

  const handleAddRow = () => {
    if (!canAddProductRow) return;

    activeFormik.setFieldValue("rows", [
      ...activeFormik.values.rows,
      buildEmptyRow(),
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (!canEditProducts) return;
    if (activeFormik.values.rows.length <= 1) return;

    activeFormik.setFieldValue(
      "rows",
      activeFormik.values.rows.filter((row) => row.id !== id),
    );
  };

  const handleUpdateCatalogPrice = async (unitPrice: number) => {
    if (!catalogPriceProduct) return;

    try {
      await updateProduct({
        id: catalogPriceProduct.id,
        data: {
          unit_price: unitPrice,
        },
      }).unwrap();

      activeFormik.setFieldValue(
        "rows",
        activeFormik.values.rows.map((row) =>
          row.id === catalogPriceProduct.rowId
            ? {
                ...row,
                unitPrice,
              }
            : row,
        ),
      );

      dispatch(
        setSnackbar({
          message: "Precio general actualizado satisfactoriamente.",
          type: "success",
        }),
      );
      setCatalogPriceProduct(null);
    } catch (error) {
      dispatch(
        setSnackbar({
          message:
            extractApiMessage(error) ||
            "No se pudo actualizar el precio general.",
          type: "error",
        }),
      );
    }
  };

  const handleEditProductRow = (id: string) => {
    setFocusedProductRowId(id);
  };

  const handleRowChange = async (
    id: string,
    field: keyof Omit<InvoiceProductInput, "id">,
    value: string | number,
  ) => {
    if (!canEditProducts) return;

    if (field === "product") {
      const productId = String(value);
      const selected = productById.get(productId);
      const fallbackUnitPrice = selected ? selected.unitPrice : 0;
      const shouldRetrieveLastPrice = Boolean(
        retrieveLastPriceEnabled && selectedInvoiceClientId && productId,
      );
      const requestKey = priceRequestSeqRef.current + 1;
      priceRequestSeqRef.current = requestKey;

      activeFormik.setFieldValue(
        "rows",
        latestRowsRef.current.map((row) =>
          row.id === id
            ? {
                ...row,
                product: productId,
                unitPrice: fallbackUnitPrice,
              }
            : row,
        ),
      );

      if (!shouldRetrieveLastPrice) return;

      priceRequestKeyByRowIdRef.current.set(id, requestKey);
      setPriceLoadingRowIds((current) => new Set(current).add(id));

      try {
        const lastPrice = await triggerGetLastProductPriceForClient({
          clientId: selectedInvoiceClientId,
          productId,
          excludeInvoiceId: invoiceId,
        }).unwrap();

        if (
          priceRequestKeyByRowIdRef.current.get(id) !== requestKey ||
          latestRowsRef.current.find((row) => row.id === id)?.product !==
            productId
        ) {
          return;
        }

        if (lastPrice) {
          activeFormik.setFieldValue(
            "rows",
            latestRowsRef.current.map((row) =>
              row.id === id
                ? {
                    ...row,
                    unitPrice: Math.max(0, Number(lastPrice.unitPrice || 0)),
                  }
                : row,
            ),
          );
        }
      } catch {
        // Keep the catalog price already shown while RTK middleware reports errors.
      } finally {
        if (priceRequestKeyByRowIdRef.current.get(id) === requestKey) {
          priceRequestKeyByRowIdRef.current.delete(id);
          setPriceLoadingRowIds((current) => {
            const next = new Set(current);
            next.delete(id);
            return next;
          });
        }
      }
      return;
    }

    activeFormik.setFieldValue(
      "rows",
      activeFormik.values.rows.map((row) => {
        if (row.id !== id) return row;

        return {
          ...row,
          [field]:
            (field === "amount" || field === "unitPrice") && value === ""
              ? ""
              : Number(value),
        };
      }),
    );
  };

  const handleCancelEdit = () => {
    clearActiveInvoiceDraft();
    setSearchParams({ mode: "review" });
  };

  const handlePrintInvoice = async () => {
    if (!invoiceWithActiveProducts) return;
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
        invoice: invoiceWithActiveProducts,
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

  if (isDetailRoute && (isFetching || isInvoiceProductsFetching)) {
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

  if (
    isDetailRoute &&
    (error || invoiceProductsError || !invoiceWithActiveProducts)
  ) {
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
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <EntityFormContainer
          title={pageTitle}
          mode={pageMode}
          inputs={[]}
          formik={activeFormik}
          onBack={() => {
            clearActiveInvoiceDraft();
            handleGoTo(AppRoutes.Invoices);
          }}
          onEdit={
            !isNewMode ? () => setSearchParams({ mode: "edit" }) : undefined
          }
          onCancelEdit={isEditMode ? handleCancelEdit : undefined}
          onSubmit={isEditMode ? handleUpdateInvoice : undefined}
          loading={isUpdating}
          submitDisabled={isUpdating}
          submitLabel="Guardar"
          headerActions={reviewHeaderActions}
          editLeadingActions={isEditMode ? retrieveLastPriceToggle : undefined}
          backAdjacentActions={isNewMode ? retrieveLastPriceToggle : undefined}
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
                  loading={isClientsFetching}
                  error={Boolean(clientError)}
                  helperText={clientError}
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
                    error: Boolean(dateError),
                    helperText: dateError,
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
                  ref={mobileAddProductButtonRef}
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddRounded />}
                  onClick={canAddProductRow ? handleAddRow : undefined}
                  disabled={!canAddProductRow || isProductsFetching}
                  tabIndex={canAddProductRow ? 0 : -1}
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
                  inputsDisabled={!canEditProducts}
                  rowErrors={canEditProducts ? productRowErrors : []}
                  addProductButtonRef={mobileAddProductButtonRef}
                  productOptions={productOptions}
                  productsLoading={isProductsFetching}
                  showCatalogPriceHint={retrieveLastPriceEnabled}
                  priceLoadingRowIds={priceLoadingRowIds}
                  focusRowId={focusedProductRowId}
                  onRowChange={handleRowChange}
                  onEditRow={handleEditProductRow}
                  onFocusRow={() => setFocusedProductRowId("")}
                  onRemoveRow={handleRemoveRow}
                  onEditCatalogPrice={setCatalogPriceProduct}
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
              <InvoiceTotalsSummary
                subtotal={summarySubtotal}
                discountPercent={activeFormik.values.discount}
                total={summaryTotal}
                disabled={!isEditable}
                onDiscountChange={(discount) =>
                  activeFormik.setFieldValue("discount", discount)
                }
              />

              {isNewMode && (
                <ClientBalanceSummary
                  currentBalance={selectedClientBalance}
                  invoiceTotal={summaryTotal}
                  paymentMode={activeFormik.values.paymentMode}
                  partialPaymentAmount={
                    activeFormik.values.partialPaymentAmount
                  }
                  onPaymentModeChange={(mode) => {
                    activeFormik.setFieldValue("paymentMode", mode);
                    if (mode === "partial") {
                      activeFormik.setFieldValue(
                        "partialPaymentAmount",
                        summaryTotal,
                      );
                    } else {
                      activeFormik.setFieldValue("partialPaymentAmount", 0);
                    }
                  }}
                  onPartialPaymentAmountChange={(amount) =>
                    activeFormik.setFieldValue("partialPaymentAmount", amount)
                  }
                />
              )}
            </Stack>

            {isNewMode && (
              <Stack
                spacing={1}
                sx={{
                  width: "100%",
                }}
              >
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
                      loading={isClientsFetching}
                      error={Boolean(clientError)}
                      helperText={clientError}
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
                      activeFormik.setFieldValue(
                        "date",
                        formatPickerDate(value),
                      )
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
                        error: Boolean(dateError),
                        helperText: dateError,
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
                  ref={desktopAddProductButtonRef}
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddRounded />}
                  onClick={canAddProductRow ? handleAddRow : undefined}
                  disabled={!canAddProductRow || isProductsFetching}
                  tabIndex={canAddProductRow ? 0 : -1}
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
                inputsDisabled={!canEditProducts}
                rowErrors={canEditProducts ? productRowErrors : []}
                addProductButtonRef={desktopAddProductButtonRef}
                productOptions={productOptions}
                productsLoading={isProductsFetching}
                showCatalogPriceHint={retrieveLastPriceEnabled}
                priceLoadingRowIds={priceLoadingRowIds}
                focusRowId={focusedProductRowId}
                onRowChange={handleRowChange}
                onEditRow={handleEditProductRow}
                onFocusRow={() => setFocusedProductRowId("")}
                onRemoveRow={handleRemoveRow}
                onEditCatalogPrice={setCatalogPriceProduct}
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
                overflow: "hidden",
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  pr: { lg: 0.75 },
                  pb: { lg: 1 },
                }}
              >
                <InvoiceTotalsSummary
                  subtotal={summarySubtotal}
                  discountPercent={activeFormik.values.discount}
                  total={summaryTotal}
                  disabled={!isEditable}
                  onDiscountChange={(discount) =>
                    activeFormik.setFieldValue("discount", discount)
                  }
                />

                {isNewMode && (
                  <ClientBalanceSummary
                    currentBalance={selectedClientBalance}
                    invoiceTotal={summaryTotal}
                    paymentMode={activeFormik.values.paymentMode}
                    partialPaymentAmount={
                      activeFormik.values.partialPaymentAmount
                    }
                    onPaymentModeChange={(mode) => {
                      activeFormik.setFieldValue("paymentMode", mode);
                      if (mode === "partial") {
                        activeFormik.setFieldValue(
                          "partialPaymentAmount",
                          summaryTotal,
                        );
                      } else {
                        activeFormik.setFieldValue("partialPaymentAmount", 0);
                      }
                    }}
                    onPartialPaymentAmountChange={(amount) =>
                      activeFormik.setFieldValue("partialPaymentAmount", amount)
                    }
                  />
                )}
              </Stack>

              {isNewMode && (
                <Stack
                  spacing={1}
                  sx={{
                    flex: "0 0 auto",
                    mt: "auto",
                    width: "100%",
                    borderTop: "1px solid #E5E7EB",
                    pt: 1.5,
                    backgroundColor: "background.paper",
                  }}
                >
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
      <ProductCatalogPriceDialog
        open={Boolean(catalogPriceProduct)}
        product={catalogPriceProduct}
        loading={isUpdatingProduct}
        onClose={() => setCatalogPriceProduct(null)}
        onConfirm={(unitPrice) => void handleUpdateCatalogPrice(unitPrice)}
      />
      <Dialog
        open={Boolean(invoiceConfirmationDialog)}
        onClose={
          invoiceConfirmationDialog?.loading
            ? undefined
            : () => setInvoiceConfirmationAction(null)
        }
        onKeyDown={(event) => {
          if (event.key !== "Enter" || invoiceConfirmationDialog?.loading) {
            return;
          }

          event.preventDefault();
          handleConfirmInvoiceAction();
        }}
      >
        <DialogTitle>{invoiceConfirmationDialog?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {invoiceConfirmationDialog?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="inherit"
            sx={{ color: "text.secondary" }}
            onClick={() => setInvoiceConfirmationAction(null)}
            disabled={invoiceConfirmationDialog?.loading}
          >
            Cancelar
          </Button>
          <Button
            ref={invoiceConfirmButtonRef}
            autoFocus
            color={invoiceConfirmationDialog?.color}
            variant="contained"
            onClick={handleConfirmInvoiceAction}
            loading={invoiceConfirmationDialog?.loading}
            disabled={invoiceConfirmationDialog?.loading}
          >
            {invoiceConfirmationDialog?.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={isDeleting ? undefined : () => setDeleteDialogOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || isDeleting) return;

          event.preventDefault();
          void handleDeleteInvoice();
        }}
      >
        <DialogTitle>Eliminar factura</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`¿Seguro que querés eliminar la factura "${getShortInvoiceId(invoice?.id || "")}"? Esta acción marcará la factura y sus productos como eliminados, sin borrar los datos de la base.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="inherit"
            sx={{ color: "text.secondary" }}
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            ref={deleteInvoiceConfirmButtonRef}
            autoFocus
            color="error"
            variant="contained"
            onClick={() => void handleDeleteInvoice()}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Eliminar factura
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
