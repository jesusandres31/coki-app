import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams, useSearchParams } from "react-router-dom";
import { DeleteRounded } from "@mui/icons-material";
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
import {
  useCreateProductTypeMutation,
  useDeleteProductTypeMutation,
  useGetProductTypeByIdQuery,
  useUpdateProductTypeMutation,
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
import { productTypesBreadcrumbFlow } from "./breadcrumbFlow";

type ProductTypePageMode = "review" | "edit";

interface ProductTypeFormValues {
  name: string;
}

const loadingCardSx = {
  minHeight: { xs: 320, md: 420 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderColor: "divider",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

export default function ProductTypeFormPage() {
  const { productTypeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const isNewMode = !productTypeId;
  const requestedDetailMode: ProductTypePageMode =
    searchParams.get("mode") === "edit" ? "edit" : "review";
  const [mode, setMode] = useState<ProductTypePageMode>(requestedDetailMode);
  const isEditMode = mode === "edit";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (isNewMode) return;
    setMode(requestedDetailMode);
  }, [isNewMode, requestedDetailMode]);

  const {
    data: productType,
    isFetching,
    error,
  } = useGetProductTypeByIdQuery(productTypeId || "", {
    skip: !productTypeId,
  });
  const [createProductType, { isLoading: isCreating }] =
    useCreateProductTypeMutation();
  const [updateProductType, { isLoading: isUpdating }] =
    useUpdateProductTypeMutation();
  const [deleteProductType, { isLoading: isDeleting }] =
    useDeleteProductTypeMutation();

  useEffect(() => {
    if (isNewMode) {
      dispatch(setBreadcrumbs(productTypesBreadcrumbFlow.create()));
      return;
    }

    dispatch(
      setBreadcrumbs(
        productTypesBreadcrumbFlow.detail(
          productTypeId || "",
          productType?.name,
          isEditMode,
        ),
      ),
    );

    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch, isEditMode, isNewMode, productType?.name, productTypeId]);

  const formik = useFormik<ProductTypeFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: productType?.name || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.SHORT_STRING.min, FORM_MSG.minLength(3))
        .max(FORM_VLDN.SHORT_STRING.max, FORM_MSG.maxLength(100)),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (isNewMode) {
        const created = await createProductType({
          data: {
            name: values.name.trim(),
          },
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Tipo de producto creado satisfactoriamente.",
            type: "success",
          }),
        );
        handleGoTo(`${AppRoutes.ConfigProductTypes}/${created.id}?mode=review`);
        return;
      }

      if (!productTypeId) return;

      await updateProductType({
        id: productTypeId,
        data: {
          name: values.name.trim(),
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Tipo de producto actualizado satisfactoriamente.",
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
    if (!productTypeId) return;

    try {
      await deleteProductType(productTypeId).unwrap();
      dispatch(
        setSnackbar({
          message: "Tipo de producto eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setDeleteDialogOpen(false);
      handleGoTo(AppRoutes.ConfigProductTypes);
    } catch (error) {
      dispatch(
        setSnackbar({
          message:
            extractApiMessage(error) ||
            "No se pudo eliminar el tipo de producto.",
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

  if (!isNewMode && (error || !productType)) {
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
            ? "Crear tipo de producto"
            : `Tipo de producto "${productType?.name || productType?.id || ""}"`
        }
        mode={isNewMode ? "new" : mode}
        inputs={inputs}
        formik={formik}
        onBack={() => handleGoTo(AppRoutes.ConfigProductTypes)}
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
        <DialogTitle>Eliminar tipo de producto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar este tipo de producto?
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
