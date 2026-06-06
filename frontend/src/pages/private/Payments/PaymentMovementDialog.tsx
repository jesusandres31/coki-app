import { useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AccountBalanceWalletRounded } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import {
  PaymentAccountMovementTypeName,
  useCreatePaymentAccountMovementMutation,
  useGetClientsQuery,
  useGetPaymentAccountMovementTypesQuery,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { setSnackbar } from "src/slices/uiSlice";
import { ClientsResponse } from "src/types/pocketbase-types";
import { formatMoney } from "src/utils/format";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";

interface PaymentMovementFormValues {
  clientId: string;
  typeId: string;
  amount: string;
  description: string;
}

interface PaymentMovementDialogProps {
  client: ClientsResponse | null;
  open: boolean;
  onClose: () => void;
  allowClientSelect?: boolean;
}

const paymentTypeLabels: Record<PaymentAccountMovementTypeName, string> = {
  payment: "Entrega",
  debt: "Deuda",
  adjustment: "Ajuste",
};

const paymentTypeOrder: PaymentAccountMovementTypeName[] = [
  "payment",
  "debt",
  "adjustment",
];

const isKnownPaymentType = (
  value: string,
): value is PaymentAccountMovementTypeName =>
  paymentTypeOrder.includes(value as PaymentAccountMovementTypeName);

export default function PaymentMovementDialog({
  client,
  open,
  onClose,
  allowClientSelect = false,
}: PaymentMovementDialogProps) {
  const dispatch = useAppDispatch();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: movementTypes = [] } = useGetPaymentAccountMovementTypesQuery();
  const [createPaymentAccountMovement, { isLoading: isCreating }] =
    useCreatePaymentAccountMovementMutation();

  const clientsById = useMemo(
    () => new Map(clients.map((item) => [item.id, item])),
    [clients],
  );

  const movementTypesById = useMemo(
    () => new Map(movementTypes.map((item) => [item.id, item])),
    [movementTypes],
  );

  const sortedMovementTypes = useMemo(
    () =>
      [...movementTypes].sort((a, b) => {
        const aName = String(a.name || "");
        const bName = String(b.name || "");
        const aIndex = paymentTypeOrder.indexOf(
          aName as PaymentAccountMovementTypeName,
        );
        const bIndex = paymentTypeOrder.indexOf(
          bName as PaymentAccountMovementTypeName,
        );

        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }),
    [movementTypes],
  );

  const defaultPaymentTypeId = useMemo(
    () => movementTypes.find((item) => item.name === "payment")?.id || "",
    [movementTypes],
  );

  const formik = useFormik<PaymentMovementFormValues>({
    enableReinitialize: true,
    initialValues: {
      clientId: client?.id || "",
      typeId: defaultPaymentTypeId,
      amount: "",
      description: "",
    },
    validationSchema: Yup.object({
      clientId: allowClientSelect
        ? Yup.string().required(FORM_MSG.required)
        : Yup.string(),
      typeId: Yup.string().required(FORM_MSG.required),
      amount: Yup.number()
        .typeError(FORM_MSG.required)
        .required(FORM_MSG.required)
        .min(FORM_VLDN.REAL_NUMBER.min, FORM_MSG.minLength(1))
        .max(FORM_VLDN.REAL_NUMBER.max, FORM_MSG.maxLength(12))
        .test(
          "movement-amount",
          "El importe no puede ser cero.",
          (value, context) => {
            if (value === undefined) return false;
            const type = movementTypesById.get(
              String(context.parent.typeId || ""),
            );
            if (type?.name === "adjustment") return true;
            return Number(value) !== 0;
          },
        )
        .test(
          "payment-debt-positive",
          "El importe debe ser mayor a cero.",
          (value, context) => {
            const type = movementTypesById.get(
              String(context.parent.typeId || ""),
            );
            const typeName = String(type?.name || "");
            if (typeName === "adjustment") return true;
            return Number(value) > 0;
          },
        ),
      description: Yup.string().max(
        FORM_VLDN.LONG_STRING.max,
        FORM_MSG.maxLength(FORM_VLDN.LONG_STRING.max),
      ),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      const selectedClient = client || clientsById.get(values.clientId);
      if (!selectedClient) return;

      const movementType = movementTypesById.get(values.typeId);
      const typeName = String(movementType?.name || "");
      if (!isKnownPaymentType(typeName)) return;

      try {
        await createPaymentAccountMovement({
          clientId: selectedClient.id,
          typeId: values.typeId,
          typeName,
          amount: Number(values.amount),
          description: values.description,
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Movimiento registrado satisfactoriamente.",
            type: "success",
          }),
        );
        handleClose();
      } catch {
        dispatch(
          setSnackbar({
            message: "No se pudo registrar el movimiento.",
            type: "error",
          }),
        );
      }
    },
  });

  const selectedClient =
    client || clientsById.get(formik.values.clientId) || null;

  const selectedType = movementTypesById.get(formik.values.typeId);
  const selectedTypeName = String(selectedType?.name || "");
  const isAdjustment = selectedTypeName === "adjustment";
  const currentBalance = Number(selectedClient?.balance ?? 0);
  const formAmount = Number(formik.values.amount || 0);
  const previewBalance =
    selectedTypeName === "payment"
      ? currentBalance - Math.abs(formAmount)
      : selectedTypeName === "debt"
        ? currentBalance + Math.abs(formAmount)
        : formAmount;

  const handleClose = () => {
    if (isCreating) return;
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar movimiento</DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          {allowClientSelect ? (
            <Autocomplete
              fullWidth
              size="small"
              options={clients}
              value={selectedClient}
              onChange={(_, value) => {
                formik.setFieldValue("clientId", value?.id || "");
                formik.setErrors({});
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => option.name || ""}
              ListboxProps={{
                sx: {
                  maxHeight: 280,
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Cliente"
                  name="clientId"
                  error={!!formik.errors.clientId}
                  helperText={formik.errors.clientId || " "}
                />
              )}
            />
          ) : (
            <TextField
              label="Cliente"
              value={selectedClient?.name || ""}
              size="small"
              fullWidth
              disabled
            />
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Saldo actual"
              value={formatMoney(currentBalance)}
              size="small"
              fullWidth
              disabled
            />
            <TextField
              label="Saldo resultante"
              value={formatMoney(previewBalance)}
              size="small"
              fullWidth
              disabled
            />
          </Stack>
          <TextField
            select
            required
            label="Tipo"
            name="typeId"
            value={formik.values.typeId}
            onChange={(event) => {
              formik.setFieldValue("typeId", event.target.value);
              formik.setErrors({});
            }}
            error={!!formik.errors.typeId}
            helperText={formik.errors.typeId || " "}
            size="small"
            fullWidth
          >
            {sortedMovementTypes.map((type) => {
              const typeName = String(type.name || "");
              const label = isKnownPaymentType(typeName)
                ? paymentTypeLabels[typeName]
                : typeName;

              return (
                <MenuItem key={type.id} value={type.id}>
                  {label}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            required
            label={isAdjustment ? "Saldo final" : "Importe"}
            name="amount"
            type="number"
            value={formik.values.amount}
            onChange={(event) => {
              formik.setFieldValue("amount", event.target.value);
              formik.setErrors({});
            }}
            error={!!formik.errors.amount}
            helperText={formik.errors.amount || " "}
            size="small"
            fullWidth
            inputProps={{
              step: 0.01,
              min: isAdjustment ? undefined : 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceWalletRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Descripción"
            name="description"
            value={formik.values.description}
            onChange={(event) => {
              formik.setFieldValue("description", event.target.value);
              formik.setErrors({});
            }}
            error={!!formik.errors.description}
            helperText={formik.errors.description || " "}
            size="small"
            fullWidth
            multiline
            minRows={2}
            inputProps={{
              maxLength: FORM_VLDN.LONG_STRING.max,
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          variant="text"
          color="inherit"
          sx={{ color: "text.secondary" }}
          onClick={handleClose}
          disabled={isCreating}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void formik.submitForm()}
          loading={isCreating}
          disabled={isCreating}
        >
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
