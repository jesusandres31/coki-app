import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  Container,
} from "@mui/material";
import {
  useCreateProductMutation,
  useGetMeasureUnitsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { ErrorMsg, Loading } from "src/components/common";
import EntityFormContainer from "src/components/common/Forms/EntityFormContainer";
import PageContainer from "src/components/common/PageContainer/PageContainer";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { Input } from "src/types";
import { MeasureunitsResponse } from "src/types/pocketbase-types";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import { productsBreadcrumbFlow } from "./breadcrumbFlow";

type ProductPageMode = "review" | "edit";

interface ProductFormValues {
  name: string;
  unit_price: number;
  measure_unit: string;
}

const loadingCardSx = {
  minHeight: { xs: 320, md: 420 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderColor: "divider",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

export default function ProductFormPage() {
  const { productId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const isNewMode = !productId;
  const requestedDetailMode: ProductPageMode =
    searchParams.get("mode") === "edit" ? "edit" : "review";
  const [mode, setMode] = useState<ProductPageMode>(requestedDetailMode);
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (isNewMode) return;
    setMode(requestedDetailMode);
  }, [isNewMode, requestedDetailMode]);

  const { data: product, isFetching, error } = useGetProductByIdQuery(productId || "", {
    skip: !productId,
  });
  const { data: measureUnits = [], isFetching: isMeasureUnitsFetching } =
    useGetMeasureUnitsQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

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
            product_type: [],
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
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Producto actualizado satisfactoriamente.",
          type: "success",
        }),
      );
      setSearchParams({ mode: "review" });
    },
  });

  const selectedMeasureUnit =
    measureUnits.find((item) => item.id === formik.values.measure_unit) || null;

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
      required: true,
      label: "Precio unitario",
      id: "unit_price",
      value: formik.values.unit_price,
      error: formik.errors.unit_price,
      min: FORM_VLDN.NN_REAL_NUMBER.min,
      max: FORM_VLDN.NN_REAL_NUMBER.max,
      type: "number",
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
        String((option as MeasureunitsResponse).name || ""),
    },
  ];

  const handleEdit = () => {
    setSearchParams({ mode: "edit" });
  };

  const handleCancelEdit = () => {
    setSearchParams({ mode: "review" });
  };

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

  if (!isNewMode && (error || !product)) {
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
    <EntityFormContainer
      title={
        isNewMode
          ? "Crear producto"
          : `Producto "${product?.name || product?.id || ""}"`
      }
      mode={isNewMode ? "new" : mode}
      inputs={inputs}
      formik={formik}
      onBack={() => handleGoTo(AppRoutes.Products)}
      onEdit={isNewMode ? undefined : handleEdit}
      onCancelEdit={isNewMode ? undefined : handleCancelEdit}
      onSubmit={() => void formik.submitForm()}
      loading={isNewMode ? isCreating : isUpdating}
      submitDisabled={isNewMode ? isCreating : isUpdating}
      submitLabel={isNewMode ? "Crear" : "Guardar"}
    />
  );
}
