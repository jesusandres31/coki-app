import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import {
  useCreateProductTypeMutation,
  useDeleteProductTypeMutation,
  useGetProductTypeByIdQuery,
  useUpdateProductTypeMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import {
  buildDeleteHeaderAction,
  buildNameInput,
  extractApiMessage,
  renderEntityFormPage,
  renderFormPageState,
  useDetailPageMode,
} from "../formPageUtils";
import { productTypesBreadcrumbFlow } from "./breadcrumbFlow";

interface ProductTypeFormValues {
  name: string;
}

export default function ProductTypeFormPage() {
  const { productTypeId } = useParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const isNewMode = !productTypeId;
  const { mode, isEditMode, setEditMode, setReviewMode } =
    useDetailPageMode(isNewMode);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      handleGoTo(AppRoutes.ConfigProductTypes);
    },
  });

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

  const reviewHeaderActions = buildDeleteHeaderAction(
    () => setDeleteDialogOpen(true),
    !isNewMode && !isEditMode,
  );

  const inputs = [buildNameInput(formik.values.name, formik.errors.name)];

  if (!isNewMode && isFetching) {
    return renderFormPageState("loading");
  }

  if (!isNewMode && (error || !productType)) {
    return renderFormPageState("error");
  }

  return renderEntityFormPage({
    title: isNewMode
      ? "Crear tipo de producto"
      : `Tipo de producto "${productType?.name || productType?.id || ""}"`,
    mode: isNewMode ? "new" : mode,
    inputs,
    formik,
    backRoute: AppRoutes.ConfigProductTypes,
    handleGoTo,
    onEdit: isNewMode ? undefined : setEditMode,
    onCancelEdit: isNewMode ? undefined : setReviewMode,
    loading: isNewMode ? isCreating : isUpdating,
    headerActions: reviewHeaderActions,
    deleteDialog: {
      open: deleteDialogOpen,
      title: "Eliminar tipo de producto",
      message: "¿Seguro que querés eliminar este tipo de producto?",
      isDeleting,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: () => void handleDelete(),
    },
  });
}
