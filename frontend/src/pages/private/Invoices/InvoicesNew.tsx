import { useMemo, useState } from "react";
import {
  AddRounded,
  ChevronLeftRounded,
  DeleteRounded,
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
  TextField,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "src/app/store";
import {
  useCreateInvoiceMutation,
  useGetClientsQuery,
  useGetProductsQuery,
} from "src/app/services/invoiceService";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { setSnackbar } from "src/slices/uiSlice";
import { formatMoney } from "src/utils/format";

interface InvoiceProductInput {
  id: string;
  product: string;
  amount: number;
  unitPrice: number;
  discount: number;
}

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
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

const getItemTotal = (item: InvoiceProductInput) =>
  Math.max(0, item.amount * item.unitPrice - item.discount);

export default function InvoicesNew() {
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();

  const { data: clients = [] } = useGetClientsQuery();
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();

  const [client, setClient] = useState("");
  const [date, setDate] = useState(getLocalDate);
  const [discount, setDiscount] = useState(0);
  const [rows, setRows] = useState<InvoiceProductInput[]>([buildEmptyRow()]);

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

  const subtotal = useMemo(
    () => rows.reduce((acc, row) => acc + getItemTotal(row), 0),
    [rows],
  );
  const total = useMemo(() => Math.max(0, subtotal - discount), [discount, subtotal]);

  const hasInvalidRows = rows.some(
    (row) =>
      !row.product ||
      row.amount <= 0 ||
      row.unitPrice < 0 ||
      row.discount < 0 ||
      row.discount > row.amount * row.unitPrice,
  );
  const canSubmit = !!client && rows.length > 0 && !hasInvalidRows;

  const handleAddRow = () => {
    setRows((prev) => [...prev, buildEmptyRow()]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const handleRowChange = (
    id: string,
    field: keyof Omit<InvoiceProductInput, "id">,
    value: string | number,
  ) => {
    setRows((prev) =>
      prev.map((row) => {
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

  const handleSubmit = async () => {
    if (!client) {
      dispatch(setSnackbar({ message: "Seleccioná un cliente.", type: "error" }));
      return;
    }

    if (rows.length === 0 || hasInvalidRows) {
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
      await createInvoice({
        client,
        date,
        discount,
        items: rows.map((row) => ({
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
      handleGoTo(AppRoutes.Invoices);
    } catch {
      // Error feedback is already handled by RTK middleware.
    }
  };

  return (
    <PageContainer>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        mb={2}
      >
        <Typography variant="h5" fontWeight={600}>
          Crear factura
        </Typography>
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

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Cliente"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { md: 180 } }}
              />
              <TextField
                size="small"
                label="Descuento factura"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value || 0)))}
                inputProps={{ min: 0, step: "0.01" }}
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
              <Typography variant="h6" fontWeight={600}>
                Productos vendidos
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

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "36%" }}>Producto</TableCell>
                    <TableCell sx={{ width: "12%" }}>Cantidad</TableCell>
                    <TableCell sx={{ width: "16%" }}>Precio unit.</TableCell>
                    <TableCell sx={{ width: "16%" }}>Descuento</TableCell>
                    <TableCell sx={{ width: "16%" }} align="right">
                      Total
                    </TableCell>
                    <TableCell sx={{ width: 56 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          value={row.product}
                          onChange={(e) =>
                            handleRowChange(row.id, "product", e.target.value)
                          }
                          SelectProps={{ native: true }}
                        >
                          <option value="">Seleccionar producto</option>
                          {products.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={row.amount}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "amount",
                              Math.max(1, Number(e.target.value || 1)),
                            )
                          }
                          inputProps={{ min: 1, step: 1 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "unitPrice",
                              Math.max(0, Number(e.target.value || 0)),
                            )
                          }
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.75, verticalAlign: "middle" }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={row.discount}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "discount",
                              Math.max(0, Number(e.target.value || 0)),
                            )
                          }
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 0.75, verticalAlign: "middle" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatMoney(getItemTotal(row))}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 0.75, verticalAlign: "middle" }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={rows.length === 1}
                        >
                          <DeleteRounded />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Subtotal: {formatMoney(subtotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Descuento factura: {formatMoney(discount)}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                Total: {formatMoney(total)}
              </Typography>
            </Stack>

            <Box display="flex" justifyContent="flex-end">
              <Button
                size="small"
                variant="contained"
                onClick={handleSubmit}
                loading={isCreating}
                disabled={!canSubmit}
              >
                Crear factura
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      </Container>
    </PageContainer>
  );
}
