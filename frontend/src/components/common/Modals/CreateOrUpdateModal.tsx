import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  Grid,
  Stack,
  TextField,
  TextFieldVariants,
} from "@mui/material";
import { Input } from "src/types";
import { handleSetFormikValue } from "src/utils/FormUtils";
import { FormikProps } from "formik";
import CustomAutocomplete from "./Inputs/CustomAutocomplete";

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
}: CreateOrUpdateModalProps) {
  const maxWidth = inputs.length > 6 ? "md" : "sm";
  const fieldSize = inputs.length > 6 ? { xs: 12, sm: 6 } : { xs: 12 };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      scroll="paper"
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle>
        {title ? title : `${isUpdate ? "Actualizar" : "Crear nuevo"} ${label}`}
      </DialogTitle>
      <DialogContent sx={{ pt: 2.5 }}>
        <Grid
          container
          spacing={1.5}
          alignItems="flex-start"
          sx={{ pt: 0.5 }}
        >
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
                    InputProps={input.InputProps}
                    disabled={input.disabled}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          {!noCancelBtn && (
            <Button
              variant="text"
              color="inherit"
              sx={{ color: "text.secondary", width: { xs: "100%", sm: "auto" } }}
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button
            loading={loading}
            disabled={loading}
            onClick={hanleConfirm}
            type="submit"
            autoFocus
            variant="contained"
            color="primary"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {confBtnLabel ? confBtnLabel : isUpdate ? "Actualizar" : "Crear"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
