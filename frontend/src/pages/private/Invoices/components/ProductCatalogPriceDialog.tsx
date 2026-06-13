import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import { formatMoney } from "src/utils/format";

export interface ProductCatalogPriceDialogProduct {
  id: string;
  name: string;
  measureUnitName: string;
  unitPrice: number;
}

interface ProductCatalogPriceDialogProps {
  open: boolean;
  product: ProductCatalogPriceDialogProduct | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (price: number) => void;
}

export default function ProductCatalogPriceDialog({
  open,
  product,
  loading = false,
  onClose,
  onConfirm,
}: ProductCatalogPriceDialogProps) {
  const [price, setPrice] = useState<number | "">(0);

  useEffect(() => {
    if (!open) return;

    setPrice(product ? Math.max(0, Number(product.unitPrice || 0)) : 0);
  }, [open, product]);

  const normalizedPrice = price === "" ? 0 : Math.max(0, Number(price || 0));
  const canConfirm = Boolean(product) && price !== "" && normalizedPrice >= 0;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Editar precio general</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            label="Producto"
            value={product?.name || ""}
            size="small"
            disabled
            fullWidth
          />
          <TextField
            label="Unidad de medida"
            value={product?.measureUnitName || "-"}
            size="small"
            disabled
            fullWidth
          />
          <NumericFormat
            customInput={TextField}
            label="Precio"
            value={price}
            valueIsNumericString
            size="small"
            fullWidth
            decimalSeparator=","
            allowedDecimalSeparators={[",", "."]}
            decimalScale={3}
            allowNegative={false}
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
            helperText={`Actual: ${formatMoney(product?.unitPrice ?? 0)}`}
            onValueChange={(values) => {
              setPrice(values.value === "" ? "" : (values.floatValue ?? 0));
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          sx={{ color: "text.secondary" }}
          disabled={loading}
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          autoFocus
          variant="contained"
          color="success"
          loading={loading}
          disabled={loading || !canConfirm}
          onClick={() => onConfirm(normalizedPrice)}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
