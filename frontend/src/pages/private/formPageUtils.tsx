import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { DeleteRounded } from "@mui/icons-material";
import { Box, Button, Card, Container } from "@mui/material";
import { FormikProps } from "formik";
import { ErrorMsg, Loading } from "src/components/common";
import ConfirmationDialog from "src/components/common/ConfirmationDialog";
import DeleteEntityDialog from "src/components/common/DeleteEntityDialog";
import EntityFormContainer from "src/components/common/Forms/EntityFormContainer";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { Input } from "src/types";
import { FORM_VLDN } from "src/utils/FormUtils";

export type DetailPageMode = "review" | "edit";

const loadingCardSx = {
  minHeight: { xs: 320, md: 420 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderColor: "divider",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

const centeredBoxSx = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const extractApiMessage = (error: unknown): string | undefined => {
  if (typeof error !== "object" || !error) return undefined;
  const maybeData = (error as { data?: unknown }).data;
  if (!maybeData || typeof maybeData !== "object") return undefined;
  const maybeMessage = (maybeData as { message?: unknown }).message;
  return typeof maybeMessage === "string" ? maybeMessage : undefined;
};

const touchFormikErrors = (errors: unknown): unknown => {
  if (Array.isArray(errors)) return errors.map(touchFormikErrors);
  if (typeof errors !== "object" || !errors) return true;

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, touchFormikErrors(value)]),
  );
};

export const requestFormConfirmation = async (
  formik: FormikProps<any>,
  onValid: () => void,
) => {
  const errors = await formik.validateForm();

  if (Object.keys(errors).length > 0) {
    await formik.setTouched(touchFormikErrors(errors) as any, false);
    return;
  }

  onValid();
};

export const useDetailPageMode = (isNewMode: boolean) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDetailMode: DetailPageMode =
    searchParams.get("mode") === "edit" ? "edit" : "review";
  const [mode, setMode] = useState<DetailPageMode>(requestedDetailMode);

  useEffect(() => {
    if (isNewMode) return;
    setMode(requestedDetailMode);
  }, [isNewMode, requestedDetailMode]);

  return {
    mode,
    isEditMode: mode === "edit",
    setReviewMode: () =>
      setSearchParams({ mode: "review" }, { state: location.state }),
    setEditMode: () =>
      setSearchParams({ mode: "edit" }, { state: location.state }),
  };
};

export const renderFormPageState = (state: "loading" | "error") => (
  <PageContainer>
    <Container component="main" maxWidth="lg" sx={{ py: 3, width: "100%", mx: "auto" }}>
      <Card variant="outlined" sx={loadingCardSx}>
        <Box
          sx={{
            ...centeredBoxSx,
            textAlign: state === "error" ? "center" : undefined,
          }}
        >
          {state === "loading" ? <Loading /> : <ErrorMsg />}
        </Box>
      </Card>
    </Container>
  </PageContainer>
);

export const buildDeleteHeaderAction = (
  onClick: () => void,
  isVisible: boolean,
) =>
  isVisible ? (
    <Button
      size="small"
      variant="contained"
      color="error"
      startIcon={<DeleteRounded />}
      onClick={onClick}
    >
      Eliminar
    </Button>
  ) : undefined;

export const buildNameInput = (value: string, error?: string): Input => ({
  required: true,
  label: "Nombre",
  id: "name",
  value,
  error,
  max: FORM_VLDN.SHORT_STRING.max,
  min: FORM_VLDN.SHORT_STRING.min,
  capitalize: true,
});

interface RenderEntityFormPageArgs {
  title: string;
  mode: "new" | DetailPageMode;
  inputs: Input[];
  formik: FormikProps<any>;
  backRoute: string;
  handleGoTo: (path: string) => void;
  onBack?: () => void;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  loading: boolean;
  onRequestSubmit: () => void;
  saveConfirmation: {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
  };
  deleteDialog: {
    open: boolean;
    title: string;
    message: string;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
  };
  headerActions?: React.ReactNode;
}

export const renderEntityFormPage = ({
  title,
  mode,
  inputs,
  formik,
  backRoute,
  handleGoTo,
  onBack,
  onEdit,
  onCancelEdit,
  loading,
  onRequestSubmit,
  saveConfirmation,
  deleteDialog,
  headerActions,
}: RenderEntityFormPageArgs) => (
  <>
    <EntityFormContainer
      title={title}
      mode={mode}
      inputs={inputs}
      formik={formik}
      onBack={onBack ?? (() => handleGoTo(backRoute))}
      onEdit={onEdit}
      onCancelEdit={onCancelEdit}
      onSubmit={onRequestSubmit}
      loading={loading}
      submitDisabled={loading}
      submitLabel={mode === "new" ? "Crear" : "Guardar"}
      headerActions={headerActions}
    />
    <ConfirmationDialog
      open={saveConfirmation.open}
      title={saveConfirmation.title}
      message={saveConfirmation.message}
      loading={loading}
      confirmColor="success"
      onCancel={saveConfirmation.onClose}
      onConfirm={() => formik.submitForm()}
    />
    <DeleteEntityDialog
      open={deleteDialog.open}
      title={deleteDialog.title}
      message={deleteDialog.message}
      isDeleting={deleteDialog.isDeleting}
      onClose={deleteDialog.onClose}
      onConfirm={deleteDialog.onConfirm}
    />
  </>
);
