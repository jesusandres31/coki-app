import { InputAdornment } from "@mui/material";
import { useFormik } from "formik";
import { CreateProductReq } from "src/interfaces";
import * as Yup from "yup";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { MSG, VLDN, NumericFormatFloat } from "src/utils/FormUtils";
import { useAppDispatch } from "src/app/store";
import {
  closeModal,
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import { productApi } from "src/app/services/productService";
import { Input } from "src/types";
import { useEffect } from "react";
import { useModal } from "src/hooks";

interface CreateOrUpdateProductProps {
  open: boolean;
  label: string;
}

export default function CreateOrUpdateProduct({
  open,
  label,
}: CreateOrUpdateProductProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [createProduct, { isLoading: isCreating }] =
    productApi.useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    productApi.useUpdateProductMutation();
  const [getProduct, { isFetching }] = productApi.useLazyGetProductQuery();
  const { isUpdate } = useModal();

  const handleGetProduct = async (id: string) => {
    try {
      const payload = await getProduct(id).unwrap();
      formik.setValues({
        name: payload.name,
        unit_price: payload.unit_price,
      });
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (isUpdate) {
      handleGetProduct(selectedItems[0]);
    }
  }, [actionModal, selectedItems]);

  const hanleConfirm = async () => {
    formik.handleSubmit();
  };

  const handleClose = () => {
    dispatch(closeModal());
    formik.resetForm();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      unit_price: "",
    },
    onSubmit: async (data: CreateProductReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          const res = await updateProduct({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate(res.name) }));
        } else {
          const res = await createProduct(data).unwrap();
          dispatch(setSnackbar({ message: MSG.successCreate(res.name) }));
        }
        handleClose();
      } catch (err) {
        throw err;
      }
      dispatch(resetSelectedItems());
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      unit_price: Yup.number()
        .required(MSG.required)
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max)),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  const inputs: Input[] = [
    {
      required: true,
      label: "Nombre",
      id: "name",
      value: formik.values.name,
      error: formik.errors.name,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
    },
    {
      required: true,
      label: "Precio Unit.",
      id: "unit_price",
      value: formik.values.unit_price,
      error: formik.errors.unit_price,
      max: VLDN.NN_REAL_NUMBER.max,
      min: VLDN.NN_REAL_NUMBER.min,
      InputProps: {
        inputComponent: NumericFormatFloat as any,
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      },
    },
  ];

  return (
    <CreateOrUpdateModal
      open={open}
      label={label}
      hanleConfirm={hanleConfirm}
      handleClose={handleClose}
      loading={isFetching || isCreating || isUpdating}
      isUpdate={isUpdate}
      inputs={inputs}
      formik={formik}
    />
  );
}
