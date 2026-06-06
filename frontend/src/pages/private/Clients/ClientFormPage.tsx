import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DeleteRounded } from "@mui/icons-material";
import {
  useCreateClientMutation,
  useDeleteClientMutation,
  useGetClientByIdQuery,
  useUpdateClientMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { ErrorMsg, Loading } from "src/components/common";
import EntityFormContainer from "src/components/common/Forms/EntityFormContainer";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { Input } from "src/types";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import { clientsBreadcrumbFlow } from "./breadcrumbFlow";

type ClientPageMode = "review" | "edit";

interface ClientFormValues {
  name: string;
  address: string;
  phone: string;
}

const loadingCardSx = {
  minHeight: { xs: 320, md: 420 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderColor: "divider",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

export default function ClientFormPage() {
  const { clientId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const isNewMode = !clientId;
  const requestedDetailMode: ClientPageMode =
    searchParams.get("mode") === "edit" ? "edit" : "review";
  const [mode, setMode] = useState<ClientPageMode>(requestedDetailMode);
  const isEditMode = mode === "edit";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (isNewMode) return;
    setMode(requestedDetailMode);
  }, [isNewMode, requestedDetailMode]);

  const { data: client, isFetching, error } = useGetClientByIdQuery(clientId || "", {
    skip: !clientId,
  });
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  useEffect(() => {
    if (isNewMode) {
      dispatch(setBreadcrumbs(clientsBreadcrumbFlow.create()));
      return;
    }
    dispatch(
      setBreadcrumbs(
        clientsBreadcrumbFlow.detail(clientId || "", client?.name, isEditMode),
      ),
    );
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [client?.name, clientId, dispatch, isEditMode, isNewMode]);

  const formik = useFormik<ClientFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: client?.name || "",
      address: client?.address || "",
      phone: client?.phone || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.SHORT_STRING.min, FORM_MSG.minLength(3))
        .max(FORM_VLDN.SHORT_STRING.max, FORM_MSG.maxLength(100)),
      address: Yup.string().max(
        FORM_VLDN.LONG_STRING.max,
        FORM_MSG.maxLength(FORM_VLDN.LONG_STRING.max),
      ),
      phone: Yup.string().max(
        FORM_VLDN.SHORT_STRING.max,
        FORM_MSG.maxLength(FORM_VLDN.SHORT_STRING.max),
      ),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (isNewMode) {
        const created = await createClient({
          data: {
            name: values.name.trim(),
            address: values.address.trim(),
            phone: values.phone.trim(),
          },
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Cliente creado satisfactoriamente.",
            type: "success",
          }),
        );
        handleGoTo(`${AppRoutes.Clients}/${created.id}?mode=review`);
        return;
      }

      if (!clientId) return;

      await updateClient({
        id: clientId,
        data: {
          name: values.name.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Cliente actualizado satisfactoriamente.",
          type: "success",
        }),
      );
      setSearchParams({ mode: "review" });
    },
  });

  const handleEdit = () => {
    setSearchParams({ mode: "edit" });
  };

  const handleCancelEdit = () => {
    setSearchParams({ mode: "review" });
  };

  const extractApiMessage = (error: unknown): string | undefined => {
    if (typeof error !== "object" || !error) return undefined;
    const maybeData = (error as { data?: unknown }).data;
    if (!maybeData || typeof maybeData !== "object") return undefined;
    const maybeMessage = (maybeData as { message?: unknown }).message;
    return typeof maybeMessage === "string" ? maybeMessage : undefined;
  };

  const handleDelete = async () => {
    if (!clientId) return;

    try {
      await deleteClient(clientId).unwrap();
      dispatch(
        setSnackbar({
          message: "Cliente eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setDeleteDialogOpen(false);
      handleGoTo(AppRoutes.Clients);
    } catch (error) {
      dispatch(
        setSnackbar({
          message: extractApiMessage(error) || "No se pudo eliminar el cliente.",
          type: "error",
        }),
      );
    }
  };

  const reviewHeaderActions =
    !isNewMode && !isEditMode ? (
      <Button
        size="small"
        variant="contained"
        color="error"
        startIcon={<DeleteRounded />}
        onClick={() => setDeleteDialogOpen(true)}
      >
        Eliminar
      </Button>
    ) : undefined;

  const inputs: Input[] = [
    {
      required: true,
      label: "Nombre",
      id: "name",
      value: formik.values.name,
      error: formik.errors.name,
      max: FORM_VLDN.SHORT_STRING.max,
      min: FORM_VLDN.SHORT_STRING.min,
      capitalize: true,
    },
    {
      required: false,
      label: "Dirección",
      id: "address",
      value: formik.values.address,
      error: formik.errors.address,
      max: FORM_VLDN.LONG_STRING.max,
      capitalize: true,
    },
    {
      required: false,
      label: "Teléfono",
      id: "phone",
      value: formik.values.phone,
      error: formik.errors.phone,
      max: FORM_VLDN.SHORT_STRING.max,
    },
  ];

  if (!isNewMode && isFetching) {
    return (
      <PageContainer>
        <Container component="main" maxWidth="lg" sx={{ py: 3, width: "100%", mx: "auto" }}>
          <Card variant="outlined" sx={loadingCardSx}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loading />
            </Box>
          </Card>
        </Container>
      </PageContainer>
    );
  }

  if (!isNewMode && (error || !client)) {
    return (
      <PageContainer>
        <Container component="main" maxWidth="lg" sx={{ py: 3, width: "100%", mx: "auto" }}>
          <Card variant="outlined" sx={loadingCardSx}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <ErrorMsg />
            </Box>
          </Card>
        </Container>
      </PageContainer>
    );
  }

  return (
    <>
      <EntityFormContainer
        title={
          isNewMode
            ? "Crear cliente"
            : `Cliente "${client?.name || client?.id || ""}"`
        }
        mode={isNewMode ? "new" : mode}
        inputs={inputs}
        formik={formik}
        onBack={() => handleGoTo(AppRoutes.Clients)}
        onEdit={isNewMode ? undefined : handleEdit}
        onCancelEdit={isNewMode ? undefined : handleCancelEdit}
        onSubmit={() => void formik.submitForm()}
        loading={isNewMode ? isCreating : isUpdating}
        submitDisabled={isNewMode ? isCreating : isUpdating}
        submitLabel={isNewMode ? "Crear" : "Guardar"}
        headerActions={reviewHeaderActions}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={isDeleting ? undefined : () => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Eliminar cliente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar este cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="inherit"
            sx={{ color: "text.secondary" }}
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
