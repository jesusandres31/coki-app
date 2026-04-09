import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeftRounded, EditRounded, SaveRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
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
  useGetInvoiceViewByIdQuery,
  useUpdateInvoiceMutation,
} from "src/app/services/invoiceService";
import { ErrorMsg, Loading } from "src/components/common";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { setSnackbar } from "src/slices/uiSlice";
import { formatDate, formatMoney } from "src/utils/format";

interface InvoiceProductRow {
  id?: string;
  product?: { name?: string } | string | null;
  product_name?: string;
  amount?: number;
  unit_price?: number;
  discount?: number;
  total?: number;
}

const getItemTotal = (item: InvoiceProductRow) =>
  Math.max(
    0,
    Number(item.total ?? Number(item.amount ?? 0) * Number(item.unit_price ?? 0) - Number(item.discount ?? 0)),
  );

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();

  const {
    data: invoice,
    isFetching,
    error,
  } = useGetInvoiceViewByIdQuery(invoiceId || "", {
    skip: !invoiceId,
  });
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [date, setDate] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!invoice || isEditMode) return;
    setDate(String(invoice.date).slice(0, 10));
    setDiscount(Number(invoice.discount ?? 0));
  }, [invoice, isEditMode]);

  const invoiceProducts: InvoiceProductRow[] = useMemo(() => {
    if (!invoice?.invoice_products || !Array.isArray(invoice.invoice_products)) {
      return [];
    }
    return invoice.invoice_products as InvoiceProductRow[];
  }, [invoice?.invoice_products]);

  const subtotal = useMemo(
    () => invoiceProducts.reduce((acc, item) => acc + getItemTotal(item), 0),
    [invoiceProducts],
  );
  const total = useMemo(() => Math.max(0, subtotal - discount), [discount, subtotal]);

  const handleSave = async () => {
    if (!invoiceId) return;
    try {
      await updateInvoice({
        id: invoiceId,
        data: {
          date,
          discount,
          total,
        },
      }).unwrap();

      dispatch(setSnackbar({ message: "Factura actualizada satisfactoriamente." }));
      setIsEditMode(false);
    } catch {
      // Error feedback is already handled by RTK middleware.
    }
  };

  if (isFetching) {
    return (
      <PageContainer>
        <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
          <Loading />
        </Container>
      </PageContainer>
    );
  }

  if (error || !invoice) {
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
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        mb={2}
      >
        <Typography variant="h5" fontWeight={600}>
          Factura {invoice.id}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {!isEditMode ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<EditRounded />}
              onClick={() => setIsEditMode(true)}
            >
              Editar
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<SaveRounded />}
              onClick={handleSave}
              loading={isUpdating}
            >
              Guardar
            </Button>
          )}
          <Button
            size="small"
            color="secondary"
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
          borderRadius: 3,
          borderColor: "divider",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cliente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {typeof invoice.client === "string"
                    ? invoice.client
                    : (invoice.client as { name?: string } | null)?.name || "-"}
                </Typography>
              </Box>

              <Box sx={{ minWidth: { md: 220 } }}>
                {isEditMode ? (
                  <TextField
                    size="small"
                    fullWidth
                    label="Fecha"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Fecha
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(invoice.date)}
                    </Typography>
                  </>
                )}
              </Box>

              <Box sx={{ minWidth: { md: 220 } }}>
                {isEditMode ? (
                  <TextField
                    size="small"
                    fullWidth
                    label="Descuento factura"
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(Math.max(0, Number(e.target.value || 0)))
                    }
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Descuento factura
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatMoney(invoice.discount)}
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>

            <Divider />

            <Typography variant="h6" fontWeight={600}>
              Productos
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Precio Unit.</TableCell>
                    <TableCell>Desc.</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceProducts.map((item, i) => {
                    const product =
                      item.product_name ||
                      (typeof item.product === "string"
                        ? item.product
                        : item.product?.name) ||
                      "-";

                    return (
                      <TableRow key={`${item.id || product}-${i}`}>
                        <TableCell>{product}</TableCell>
                        <TableCell>{item.amount ?? 0}</TableCell>
                        <TableCell>{formatMoney(item.unit_price)}</TableCell>
                        <TableCell>{formatMoney(item.discount)}</TableCell>
                        <TableCell align="right">{formatMoney(getItemTotal(item))}</TableCell>
                      </TableRow>
                    );
                  })}
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
          </Stack>
        </CardContent>
      </Card>
      </Container>
    </PageContainer>
  );
}
