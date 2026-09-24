import { useEffect, useState } from "react";
import {
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import ConfirmationDialog from "src/components/common/ConfirmationDialog";
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
  onConfirm: (price: number) => void | Promise<void>;
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
    <ConfirmationDialog
      open={open}
      title="Actualizar precio general"
      message={`¿Confirmás actualizar el precio general del producto "${product?.name || ""}"?`}
      loading={loading}
      confirmDisabled={!canConfirm}
      confirmColor="success"
      onCancel={onClose}
      onConfirm={() => onConfirm(normalizedPrice)}
      maxWidth="xs"
    >
      <Stack spacing={2} sx={{ pt: 2 }}>
        <TextField
          label="Producto"
          value={product?.name || ""}
          size="small"
          disabled
          fullWidth
        />
        <TextField
          label="Ud. medida"
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
          thousandSeparator="."
          allowedDecimalSeparators={[",", "."]}
          decimalScale={3}
          allowNegative={false}
          disabled={loading}
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
    </ConfirmationDialog>
  );
}
