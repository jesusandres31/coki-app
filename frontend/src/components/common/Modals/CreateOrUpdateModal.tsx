import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  Grid,
  TextField,
  TextFieldVariants,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Input } from "src/types";
import { handleSetFormikValue } from "src/utils/FormUtils";
import { STYLE } from "src/constants";
import { FormikProps } from "formik";
import CustomAutocomplete from "./Inputs/CustomAutocomplete";
import { useUI } from "src/hooks";

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
  const { isMobile } = useUI();
  const maxWidth = inputs.length > 6 ? "md" : "sm";
  const columns = inputs.length > 6 ? { sm: 12 } : { sm: 8 };
  const direction = isMobile || inputs.length <= 3 ? "column" : "row";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      maxWidth={maxWidth}
    >
      <DialogTitle>
        {title ? title : `${isUpdate ? "Actualizar" : "Crear nuevo"} ${label}`}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          pt: 4,
        }}
      >
        <Grid container spacing={2} columns={columns} direction={direction}>
          {inputs.map((input) => (
            <Grid
              item
              xs={2}
              sm={4}
              md={6}
              key={input.id}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {!input.hide ? (
                input.options ? (
                  <CustomAutocomplete
                    input={input}
                    formik={formik}
                    fetchItemsFunc={input.fetchItemsFunc}
                    options={input.options}
                    loading={input.loading}
                    getOptionLabel={input.getOptionLabel}
                    variant={variant}
                    triggerSideEffect={input.triggerSideEffect}
                  />
                ) : (
                  <TextField
                    required={input.required}
                    label={input.label}
                    id={input.id}
                    name={input.id}
                    value={input.value}
                    multiline={input.multiline}
                    placeholder={""}
                    onChange={(e) => handleSetFormikValue(e, formik, input)}
                    autoComplete="off"
                    error={!!input.error}
                    helperText={input.error ? input.error : " "}
                    variant={variant}
                    size="small"
                    inputProps={{
                      max: input.max,
                      min: input.min,
                    }}
                    InputProps={input.InputProps}
                    sx={{ width: STYLE.width.textfield }}
                    disabled={input.disabled}
                  />
                )
              ) : null}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        {!noCancelBtn && (
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancelar
          </Button>
        )}
        <LoadingButton
          loading={loading}
          onClick={hanleConfirm}
          type="submit"
          autoFocus
          variant="contained"
        >
          {confBtnLabel ? confBtnLabel : isUpdate ? "Actualizar" : "Crear"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
