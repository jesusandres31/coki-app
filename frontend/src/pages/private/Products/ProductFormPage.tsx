import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetMeasureUnitsQuery,
  useGetProductByIdQuery,
  useGetProductTypesListQuery,
  useUpdateProductMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { Input } from "src/types";
import { MeasureunitsResponse, ProductTypesResponse } from "src/types/pocketbase-types";
import { FORM_MSG, FORM_VLDN, NumericFormatFloat } from "src/utils/FormUtils";
import { getMeasureUnitDisplayName } from "src/utils/measureUnits";
import {
  buildDeleteHeaderAction,
  buildNameInput,
  extractApiMessage,
  renderEntityFormPage,
  renderFormPageState,
  useDetailPageMode,
} from "../formPageUtils";
import { productsBreadcrumbFlow } from "./breadcrumbFlow";

interface ProductFormValues {
  name: string;
  unit_price: number;
  measure_unit: string;
  product_type: string[];
}

export default function ProductFormPage() {
  const { productId } = useParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const isNewMode = !productId;
  const { mode, isEditMode, setEditMode, setReviewMode } =
    useDetailPageMode(isNewMode);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: product, isFetching, error } = useGetProductByIdQuery(productId || "", {
    skip: !productId,
  });
  const { data: measureUnits = [], isFetching: isMeasureUnitsFetching } =
    useGetMeasureUnitsQuery();
  const {
    data: productTypesResponse,
    isFetching: isProductTypesFetching,
  } = useGetProductTypesListQuery({
    page: 1,
    perPage: 500,
    order: "asc",
    orderBy: "name",
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const productTypes = productTypesResponse?.items || [];

  useEffect(() => {
    if (isNewMode) {
      dispatch(setBreadcrumbs(productsBreadcrumbFlow.create()));
      return;
    }
    dispatch(
      setBreadcrumbs(
        productsBreadcrumbFlow.detail(productId || "", product?.name, isEditMode),
      ),
    );
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch, isEditMode, isNewMode, product?.name, productId]);

  const formik = useFormik<ProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: product?.name || "",
      unit_price: Number(product?.unit_price ?? 0),
      measure_unit: String(product?.measure_unit || ""),
      product_type: Array.isArray(product?.product_type)
        ? product.product_type
        : [],
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.SHORT_STRING.min, FORM_MSG.minLength(3))
        .max(FORM_VLDN.SHORT_STRING.max, FORM_MSG.maxLength(100)),
      unit_price: Yup.number()
        .typeError("Ingresá un precio válido.")
        .min(FORM_VLDN.NN_REAL_NUMBER.min, "El precio no puede ser negativo.")
        .max(
          FORM_VLDN.NN_REAL_NUMBER.max,
          `El precio no puede superar ${FORM_VLDN.NN_REAL_NUMBER.max}.`,
        )
        .required(FORM_MSG.required),
      measure_unit: Yup.string().required(FORM_MSG.required),
      product_type: Yup.array().of(Yup.string()),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (isNewMode) {
        const created = await createProduct({
          data: {
            name: values.name.trim(),
            unit_price: Number(values.unit_price || 0),
            measure_unit: values.measure_unit,
            product_type: values.product_type,
          },
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Producto creado satisfactoriamente.",
            type: "success",
          }),
        );
        handleGoTo(`${AppRoutes.Products}/${created.id}?mode=review`);
        return;
      }

      if (!productId) return;

      await updateProduct({
        id: productId,
        data: {
          name: values.name.trim(),
          unit_price: Number(values.unit_price || 0),
          measure_unit: values.measure_unit,
          product_type: values.product_type,
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Producto actualizado satisfactoriamente.",
          type: "success",
        }),
      );
      handleGoTo(AppRoutes.Products);
    },
  });

  const selectedMeasureUnit =
    measureUnits.find((item) => item.id === formik.values.measure_unit) || null;
  const selectedProductTypes = productTypes.filter((item) =>
    formik.values.product_type.includes(item.id),
  );

  const inputs: Input[] = [
    buildNameInput(formik.values.name, formik.errors.name),
    {
      required: true,
      label: "Precio unitario",
      id: "unit_price",
      value: formik.values.unit_price,
      error: formik.errors.unit_price,
      min: FORM_VLDN.NN_REAL_NUMBER.min,
      max: FORM_VLDN.NN_REAL_NUMBER.max,
      InputProps: {
        inputComponent: NumericFormatFloat as any,
        startAdornment: (
          <InputAdornment
            position="start"
            sx={{ mr: 0.75, minWidth: 14, justifyContent: "center" }}
          >
            $
          </InputAdornment>
        ),
      },
    },
    {
      required: true,
      label: "Unidad de medida",
      id: "measure_unit",
      value: formik.values.measure_unit,
      error: formik.errors.measure_unit,
      options: measureUnits,
      loading: isMeasureUnitsFetching,
      startValue: selectedMeasureUnit || undefined,
      getOptionLabel: (option) =>
        getMeasureUnitDisplayName(option as MeasureunitsResponse),
    },
    {
      required: false,
      label: "Tipos de producto",
      id: "product_type",
      value: formik.values.product_type,
      error: formik.errors.product_type,
      options: productTypes,
      loading: isProductTypesFetching,
      multiple: true,
      startValue: selectedProductTypes,
      getOptionLabel: (option) =>
        String((option as ProductTypesResponse).name || ""),
    },
  ];

  const handleDelete = async () => {
    if (!productId) return;

    try {
      await deleteProduct(productId).unwrap();
      dispatch(
        setSnackbar({
          message: "Producto eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setDeleteDialogOpen(false);
      handleGoTo(AppRoutes.Products);
    } catch (error) {
      dispatch(
        setSnackbar({
          message:
            extractApiMessage(error) || "No se pudo eliminar el producto.",
          type: "error",
        }),
      );
    }
  };

  const reviewHeaderActions = buildDeleteHeaderAction(
    () => setDeleteDialogOpen(true),
    !isNewMode && !isEditMode,
  );

  if (!isNewMode && isFetching) {
    return renderFormPageState("loading");
  }

  if (!isNewMode && (error || !product)) {
    return renderFormPageState("error");
  }

  return renderEntityFormPage({
    title: isNewMode
      ? "Crear producto"
      : `Producto "${product?.name || product?.id || ""}"`,
    mode: isNewMode ? "new" : mode,
    inputs,
    formik,
    backRoute: AppRoutes.Products,
    handleGoTo,
    onEdit: isNewMode ? undefined : setEditMode,
    onCancelEdit: isNewMode ? undefined : setReviewMode,
    loading: isNewMode ? isCreating : isUpdating,
    headerActions: reviewHeaderActions,
    deleteDialog: {
      open: deleteDialogOpen,
      title: "Eliminar producto",
      message: "¿Seguro que querés eliminar este producto?",
      isDeleting,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: () => void handleDelete(),
    },
  });
}
