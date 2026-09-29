import { EditRounded } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { useUpdateProductMutation } from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import ProductListGrid from "src/pages/private/Products/ProductListGrid";
import {
  resetBreadcrumbs,
  setBreadcrumbs,
  setSnackbar,
} from "src/slices/uiSlice";
import { DataGridRowAction, Input } from "src/types";
import { ProductsResponse } from "src/types/pocketbase-types";
import { FORM_MSG, FORM_VLDN, NumericFormatFloat } from "src/utils/FormUtils";
import { extractApiMessage } from "../formPageUtils";

interface PriceFormValues {
  unit_price: number | string;
}

export default function PriceList() {
  const dispatch = useAppDispatch();
  const [productToEdit, setProductToEdit] =
    useState<ProductsResponse | null>(null);
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateProductMutation();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: "Lista de precios" }]));
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [dispatch]);

  const formik = useFormik<PriceFormValues>({
    enableReinitialize: true,
    initialValues: {
      unit_price: Number(productToEdit?.unit_price ?? 0),
    },
    validationSchema: Yup.object({
      unit_price: Yup.number()
        .typeError("Ingresá un precio válido.")
        .min(FORM_VLDN.NN_REAL_NUMBER.min, "El precio no puede ser negativo.")
        .max(
          FORM_VLDN.NN_REAL_NUMBER.max,
          `El precio no puede superar ${FORM_VLDN.NN_REAL_NUMBER.max}.`,
        )
        .required(FORM_MSG.required),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!productToEdit) return;

      try {
        await updateProduct({
          id: productToEdit.id,
          data: { unit_price: Number(values.unit_price) },
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Precio actualizado satisfactoriamente.",
            type: "success",
          }),
        );
        setProductToEdit(null);
        formik.resetForm();
      } catch (error) {
        dispatch(
          setSnackbar({
            message:
              extractApiMessage(error) ||
              "No se pudo actualizar el precio del producto.",
            type: "error",
          }),
        );
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setProductToEdit(null);
  };

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "edit-price",
        label: "Editar",
        mobileLabel: "Editar",
        icon: <EditRounded fontSize="small" color="info" />,
        onClick: (item) => setProductToEdit(item as ProductsResponse),
      },
    ],
    [],
  );

  const inputs: Input[] = [
    {
      required: true,
      label: "Precio",
      id: "unit_price",
      value: formik.values.unit_price,
      error: formik.errors.unit_price,
      min: FORM_VLDN.NN_REAL_NUMBER.min,
      max: FORM_VLDN.NN_REAL_NUMBER.max,
      InputProps: {
        inputComponent: NumericFormatFloat as any,
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      },
    },
  ];

  return (
    <>
      <ProductListGrid rowActions={rowActions} />
      <CreateOrUpdateModal
        open={Boolean(productToEdit)}
        title="Editar precio"
        confirmationMessage={`Modificá el precio del producto "${productToEdit?.name || "-"}".`}
        confBtnLabel="Guardar"
        hanleConfirm={formik.handleSubmit}
        handleClose={handleClose}
        loading={isUpdating}
        isUpdate
        fullScreenOnMobile={false}
        fieldsTopSpacing={3}
        inputs={inputs}
        formik={formik}
      />
    </>
  );
}
