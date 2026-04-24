import {
  AddRounded,
  CancelRounded,
  ChevronLeftRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  SxProps,
  Stack,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { FormikProps } from "formik";
import { ReactNode } from "react";
import { Input } from "src/types";
import { handleSetFormikValue } from "src/utils/FormUtils";
import CustomAutocomplete from "src/components/common/Modals/Inputs/CustomAutocomplete";
import PageContainer from "src/components/common/PageContainer/PageContainer";

type EntityPageMode = "new" | "review" | "edit";

interface EntityFormContainerProps {
  title: string;
  mode: EntityPageMode;
  inputs: Input[];
  formik: FormikProps<any>;
  onBack: () => void;
  onSubmit?: () => void;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
  headerActions?: ReactNode;
  showDefaultNewSubmit?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  containerSx?: SxProps<Theme>;
  cardSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  children?: ReactNode;
}

export default function EntityFormContainer({
  title,
  mode,
  inputs,
  formik,
  onBack,
  onSubmit,
  onEdit,
  onCancelEdit,
  loading = false,
  submitDisabled = false,
  submitLabel,
  headerActions,
  showDefaultNewSubmit = true,
  maxWidth = "lg",
  containerSx,
  cardSx,
  contentSx,
  children,
}: EntityFormContainerProps) {
  const isReview = mode === "review";
  const isEdit = mode === "edit";
  const isNew = mode === "new";
  const editable = !isReview;
  const hasCustomContent = Boolean(children);

  return (
    <PageContainer>
      <Container
        component="main"
        maxWidth={maxWidth}
        sx={{ py: { xs: 2, md: 3 }, ...containerSx }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1}
          mb={1.5}
        >
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {title}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {isReview && onEdit ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<EditRounded />}
                color="info"
                onClick={onEdit}
              >
                Editar
              </Button>
            ) : null}

            {isEdit ? (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<SaveRounded />}
                  onClick={onSubmit}
                  loading={loading}
                  disabled={submitDisabled}
                >
                  {submitLabel || "Guardar"}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<CancelRounded />}
                  onClick={onCancelEdit}
                  disabled={loading}
                >
                  Cancelar edición
                </Button>
              </>
            ) : null}

            {headerActions}

            <Button
              color="primary"
              size="small"
              variant="contained"
              startIcon={<ChevronLeftRounded />}
              onClick={onBack}
            >
              Atrás
            </Button>
          </Stack>
        </Stack>

        <Card
          variant="outlined"
          sx={{
            borderColor: "divider",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            ...cardSx,
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 }, ...contentSx }}>
            {hasCustomContent ? (
              children
            ) : (
              <>
                <Grid container spacing={2}>
                  {inputs.map((input) => {
                    if (input.hide) return null;

                    const effectiveInput: Input = {
                      ...input,
                      disabled: input.disabled || !editable,
                    };

                    return (
                      <Grid key={effectiveInput.id} size={{ xs: 12, md: 6 }}>
                        {effectiveInput.options ? (
                          <CustomAutocomplete
                            input={effectiveInput}
                            formik={formik}
                            fetchItemsFunc={effectiveInput.fetchItemsFunc}
                            options={effectiveInput.options}
                            loading={effectiveInput.loading}
                            getOptionLabel={effectiveInput.getOptionLabel}
                            triggerSideEffect={effectiveInput.triggerSideEffect}
                          />
                        ) : (
                          <TextField
                            required={effectiveInput.required}
                            fullWidth
                            label={effectiveInput.label}
                            id={effectiveInput.id}
                            name={effectiveInput.id}
                            value={effectiveInput.value}
                            multiline={effectiveInput.multiline}
                            type={effectiveInput.type ?? "text"}
                            onChange={(e) =>
                              handleSetFormikValue(e, formik, effectiveInput)
                            }
                            autoComplete={effectiveInput.autoComplete ?? "off"}
                            error={!!effectiveInput.error}
                            helperText={
                              effectiveInput.error ? effectiveInput.error : " "
                            }
                            variant="outlined"
                            size="small"
                            inputProps={{
                              max: effectiveInput.max,
                              min: effectiveInput.min,
                            }}
                            InputProps={effectiveInput.InputProps}
                            disabled={effectiveInput.disabled}
                          />
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
                {isNew && showDefaultNewSubmit ? (
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    sx={{ mt: 1.5 }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddRounded />}
                      onClick={onSubmit}
                      loading={loading}
                      disabled={submitDisabled}
                    >
                      {submitLabel || "Crear"}
                    </Button>
                  </Stack>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Box sx={{ height: 8 }} />
      </Container>
    </PageContainer>
  );
}
