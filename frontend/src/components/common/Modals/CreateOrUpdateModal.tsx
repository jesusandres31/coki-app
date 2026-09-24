import {
  Grid,
  TextField,
  TextFieldVariants,
} from "@mui/material";
import { Input } from "src/types";
import { handleSetFormikValue } from "src/utils/FormUtils";
import { FormikProps } from "formik";
import CustomAutocomplete from "./Inputs/CustomAutocomplete";
import { withLoadingInputProps } from "src/components/common/Inputs/loadingInputProps";
import ConfirmationDialog from "src/components/common/ConfirmationDialog";

interface CreateOrUpdateModalProps {
  open: boolean;
  label?: string;
  hanleConfirm: () => void;
  handleClose: () => void;
  loading?: boolean;
  isUpdate?: boolean;
  inputs: Input[];
  formik: FormikProps<any>;
  title?: string;
  confBtnLabel?: string;
  noCancelBtn?: boolean;
  variant?: TextFieldVariants;
  confirmationMessage?: string;
}

export default function CreateOrUpdateModal({
  open,
  label = "Item",
  hanleConfirm,
  handleClose,
  loading = false,
  isUpdate = false,
  inputs,
  formik,
  title,
  confBtnLabel = "",
  noCancelBtn = false,
  variant = "outlined",
  confirmationMessage,
}: CreateOrUpdateModalProps) {
  const maxWidth = inputs.length > 6 ? "md" : "sm";
  const fieldSize = inputs.length > 6 ? { xs: 12, sm: 6 } : { xs: 12 };

  return (
    <ConfirmationDialog
      open={open}
      title={title ? title : `${isUpdate ? "Actualizar" : "Crear nuevo"} ${label}`}
      message={
        confirmationMessage ||
        `¿Confirmás ${isUpdate ? "actualizar" : "crear"} ${label.toLowerCase()}?`
      }
      loading={loading}
      confirmLabel={confBtnLabel || "Confirmar"}
      showCancel={!noCancelBtn}
      onCancel={handleClose}
      onConfirm={hanleConfirm}
      maxWidth={maxWidth}
    >
      <Grid container spacing={1.5} alignItems="flex-start" sx={{ pt: 2 }}>
        {inputs.map((input) => {
          if (input.hide) return null;

          return (
            <Grid key={input.id} size={fieldSize}>
              {input.options ? (
                <CustomAutocomplete
                  input={input}
                  formik={formik}
                  fetchItemsFunc={input.fetchItemsFunc}
                  options={input.options}
                  loading={input.loading}
                  getOptionLabel={input.getOptionLabel}
                  variant={variant}
                  triggerSideEffect={input.triggerSideEffect}
                  fullWidth
                />
              ) : (
                <TextField
                  required={input.required}
                  fullWidth
                  label={input.label}
                  id={input.id}
                  name={input.id}
                  value={input.value}
                  multiline={input.multiline}
                  type={input.type ?? "text"}
                  onChange={(e) => handleSetFormikValue(e, formik, input)}
                  autoComplete={input.autoComplete ?? "off"}
                  error={!!input.error}
                  helperText={input.error ? input.error : " "}
                  variant={variant}
                  size="small"
                  inputProps={{
                    max: input.max,
                    min: input.min,
                  }}
                  InputProps={withLoadingInputProps(
                    input.InputProps,
                    input.loading,
                  )}
                  disabled={input.disabled || loading}
                />
              )}
            </Grid>
          );
        })}
      </Grid>
    </ConfirmationDialog>
  );
}
