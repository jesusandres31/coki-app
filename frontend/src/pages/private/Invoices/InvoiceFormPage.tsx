import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";
import {
  AddRounded,
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
import { useAppDispatch } from "src/app/store";
import {
  useCreateInvoiceMutation,
  useGetClientsQuery,
  useGetInvoiceViewByIdQuery,
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

interface InvoiceProductInput {
  id: string;
  product: string;
  amount: number;
  unitPrice: number;
  discount: number;
}

interface InvoiceProductRow {
  id?: string;
  product?: { name?: string } | string | null;
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

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const parsePickerDate = (value: string) => (value ? dayjs(value) : null);
const formatPickerDate = (value: Dayjs | null) =>
  value ? value.format("YYYY-MM-DD") : "";

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

const getDetailItemTotal = (item: InvoiceProductRow) =>
  Math.max(
    0,
    Number(
      item.total ??
        Number(item.amount ?? 0) *
          Number(item.unit_price ?? 0) *
          (1 - Math.max(0, Math.min(100, Number(item.discount ?? 0))) / 100),
    ),
  );

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
            <TableCell sx={{ width: "36%" }}>Producto</TableCell>
            <TableCell sx={{ width: "12%" }}>Cantidad</TableCell>
            <TableCell sx={{ width: "16%" }}>Precio unit.</TableCell>
            <TableCell sx={{ width: "16%" }}>Descuento (%)</TableCell>
            <TableCell sx={{ width: "16%" }} align="right">
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
                      Math.min(100, Math.max(0, Number(e.target.value || 0))),
                    )
                  }
                  inputProps={{ min: 0, max: 100, step: "0.01" }}
                  disabled={!editable}
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
    skip: !isNewMode,
  });
  const { data: products = [], isLoading: isProductsLoading } =
    useGetProductsQuery(undefined, { skip: !isNewMode });
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

  const newFormik = useFormik<{
    client: string;
    date: string;
    discount: number;
    rows: InvoiceProductInput[];
  }>({
    initialValues: {
      client: "",
      date: getLocalDate(),
      discount: 0,
      rows: [buildEmptyRow()],
    },
    onSubmit: async (values) => {
      if (!values.client) {
        dispatch(
          setSnackbar({ message: "Seleccioná un cliente.", type: "error" }),
        );
        return;
      }

      const invalidRows = values.rows.some(
        (row) =>
          !row.product ||
          row.amount <= 0 ||
          row.unitPrice < 0 ||
          row.discount < 0 ||
          row.discount > 100,
      );

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
          date: values.date,
          discount: values.discount,
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

  const editFormik = useFormik<{
    date: string;
    discount: number;
  }>({
    initialValues: {
      date: "",
      discount: 0,
    },
    onSubmit: async (values) => {
      if (!invoiceId) return;
      try {
        await updateInvoice({
          id: invoiceId,
          data: {
            date: values.date,
            discount: values.discount,
            total: Math.max(0, detailSubtotal * (1 - values.discount / 100)),
          },
        }).unwrap();

        dispatch(
          setSnackbar({ message: "Factura actualizada satisfactoriamente." }),
        );
        setMode("review");
      } catch {
        // Error feedback is already handled by RTK middleware.
      }
    },
  });

  useEffect(() => {
    if (!invoice || isNewMode || isEditMode) return;
    editFormik.setValues({
      date: String(invoice.date).slice(0, 10),
      discount: Number(invoice.discount ?? 0),
    });
  }, [invoice, isEditMode, isNewMode]);

  const invoiceProducts: InvoiceProductRow[] = useMemo(() => {
    if (
      !invoice?.invoice_products ||
      !Array.isArray(invoice.invoice_products)
    ) {
      return [];
    }
    return invoice.invoice_products as InvoiceProductRow[];
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
      invoiceProducts.reduce((acc, item) => acc + getDetailItemTotal(item), 0),
    [invoiceProducts],
  );
  const detailTotal = useMemo(
    () => Math.max(0, detailSubtotal * (1 - editFormik.values.discount / 100)),
    [detailSubtotal, editFormik.values.discount],
  );

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
          amount: row.amount,
          unitPrice: row.unitPrice,
          discount: row.discount,
          total: getCreateItemTotal(row),
        };
      }),
    [newFormik.values.rows, productOptions],
  );

  const detailTableRows = useMemo<ProductTableRowData[]>(
    () =>
      invoiceProducts.map((item, i) => ({
        id: item.id || `row-${i}`,
        productId: "",
        productName:
          item.product_name ||
          (typeof item.product === "string"
            ? item.product
            : item.product?.name) ||
          "-",
        amount: Number(item.amount ?? 0),
        unitPrice: Number(item.unit_price ?? 0),
        discount: Number(item.discount ?? 0),
        total: getDetailItemTotal(item),
      })),
    [invoiceProducts],
  );

  const hasInvalidRows = newFormik.values.rows.some(
    (row) =>
      !row.product ||
      row.amount <= 0 ||
      row.unitPrice < 0 ||
      row.discount < 0 ||
      row.discount > 100,
  );
  const canCreate =
    !!newFormik.values.client &&
    newFormik.values.rows.length > 0 &&
    !hasInvalidRows;

  const handleAddRow = () => {
    newFormik.setFieldValue("rows", [
      ...newFormik.values.rows,
      buildEmptyRow(),
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (newFormik.values.rows.length <= 1) return;
    newFormik.setFieldValue(
      "rows",
      newFormik.values.rows.filter((row) => row.id !== id),
    );
  };

  const handleRowChange = (
    id: string,
    field: keyof Omit<InvoiceProductInput, "id">,
    value: string | number,
  ) => {
    newFormik.setFieldValue(
      "rows",
      newFormik.values.rows.map((row) => {
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
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={() => void editFormik.submitForm()}
                    loading={isUpdating}
                  >
                    Guardar
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<EditRounded />}
                    color="info"
                    onClick={() => setMode("edit")}
                  >
                    Editar
                  </Button>
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
              {isNewMode ? (
                <Stack spacing={2.5} sx={{ flex: "1 1 auto", minHeight: 0 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <DebouncedAutocomplete
                      options={clientOptions}
                      valueId={newFormik.values.client}
                      label="Cliente"
                      placeholder="Seleccionar cliente"
                      onChange={(value) =>
                        newFormik.setFieldValue("client", value)
                      }
                    />
                    <DatePicker
                      label="Fecha"
                      value={parsePickerDate(newFormik.values.date)}
                      onChange={(value) =>
                        newFormik.setFieldValue("date", formatPickerDate(value))
                      }
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          size: "small",
                        },
                      }}
                      sx={{ minWidth: { md: 180 } }}
                    />
                    <TextField
                      size="small"
                      label="Descuento factura (%)"
                      type="number"
                      value={newFormik.values.discount}
                      onChange={(e) =>
                        newFormik.setFieldValue(
                          "discount",
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value || 0)),
                          ),
                        )
                      }
                      inputProps={{ min: 0, max: 100, step: "0.01" }}
                      sx={{ minWidth: { md: 200 } }}
                    />
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
                      onClick={handleAddRow}
                      disabled={isProductsLoading}
                    >
                      Agregar producto
                    </Button>
                  </Stack>

                  <ProductsTable
                    rows={createTableRows}
                    editable
                    productOptions={productOptions}
                    onRowChange={handleRowChange}
                    onRemoveRow={handleRemoveRow}
                    canRemoveRow={() => newFormik.values.rows.length > 1}
                  />

                  <Divider />

                  <Box
                    sx={{
                      mt: "auto",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <InvoiceTotalsSummary
                      subtotal={newSubtotal}
                      discountPercent={newFormik.values.discount}
                      total={newTotal}
                    />

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => void newFormik.submitForm()}
                      loading={isCreating}
                      disabled={!canCreate}
                    >
                      Crear factura
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={2.5} sx={{ flex: "1 1 auto", minHeight: 0 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cliente"
                        value={
                          typeof invoice?.client === "string"
                            ? invoice.client
                            : (invoice?.client as { name?: string } | null)
                                ?.name || "-"
                        }
                        disabled
                      />
                    </Box>

                    <Box sx={{ minWidth: { md: 220 } }}>
                      <DatePicker
                        label="Fecha"
                        value={parsePickerDate(editFormik.values.date)}
                        onChange={(value) =>
                          editFormik.setFieldValue(
                            "date",
                            formatPickerDate(value),
                          )
                        }
                        format="DD/MM/YYYY"
                        disabled={!isEditMode}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
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
                        value={editFormik.values.discount}
                        onChange={(e) =>
                          editFormik.setFieldValue(
                            "discount",
                            Math.min(
                              100,
                              Math.max(0, Number(e.target.value || 0)),
                            ),
                          )
                        }
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        disabled={!isEditMode}
                      />
                    </Box>
                  </Stack>

                  <Divider />

                  <Typography variant="subtitle1" fontWeight={600}>
                    Productos
                  </Typography>

                  <ProductsTable
                    rows={detailTableRows}
                    editable={false}
                    productOptions={[]}
                  />

                  <Divider />

                  <Box sx={{ mt: "auto" }}>
                    <InvoiceTotalsSummary
                      subtotal={detailSubtotal}
                      discountPercent={editFormik.values.discount}
                      total={detailTotal}
                    />
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Container>
      </LocalizationProvider>
    </PageContainer>
  );
}
