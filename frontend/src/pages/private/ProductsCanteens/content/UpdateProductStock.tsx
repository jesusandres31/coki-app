import { useFormik } from "formik";
import { CreateProductCanteenReq } from "src/interfaces";
import * as Yup from "yup";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { MSG, VLDN } from "src/utils/FormUtils";
import { useAppDispatch } from "src/app/store";
import {
  closeModal,
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import { Input } from "src/types";
import { useEffect } from "react";
import { useAuth, useModal } from "src/hooks";
import { productCanteenApi } from "src/app/services/productCanteenService";

interface UpdateProductStockProps {
  open: boolean;
  label: string;
}

export default function UpdateProductStock({
  open,
  label,
}: UpdateProductStockProps) {
  const dispatch = useAppDispatch();
  const { currentCanteen } = useAuth();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [updateProductCanteen, { isLoading: isUpdating }] =
    productCanteenApi.useUpdateProductCanteenMutation();
  const [getProductCanteen, { isFetching }] =
    productCanteenApi.useLazyGetProductCanteenQuery();
  const { isUpdate } = useModal();

  const handleGetProductCanteen = async (id: string) => {
    try {
      const payload = await getProductCanteen(id).unwrap();
      formik.setValues({
        product: payload.product,
        canteen: payload.canteen,
        stock: payload.stock,
      });
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (isUpdate) {
      handleGetProductCanteen(selectedItems[0]);
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
      product: "",
      canteen: currentCanteen,
      stock: 0,
    },
    onSubmit: async (data: CreateProductCanteenReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          await updateProductCanteen({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate() }));
        }
        handleClose();
      } catch (err) {
        console.log("ASDASDasd");
        console.log(err);
        throw err;
      }
      dispatch(resetSelectedItems());
    },
    validationSchema: Yup.object({
      stock: Yup.string()
        .required(MSG.required)
        .min(VLDN.REAL_NUMBER.min, MSG.minLength(VLDN.REAL_NUMBER.min))
        .max(VLDN.REAL_NUMBER.max, MSG.maxLength(VLDN.REAL_NUMBER.max)),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  const inputs: Input[] = [
    {
      required: false,
      label: "Stock",
      id: "stock",
      value: formik.values.stock,
      error: formik.errors.stock,
      max: VLDN.REAL_NUMBER.max,
      min: VLDN.REAL_NUMBER.min,
    },
  ];

  return (
    <CreateOrUpdateModal
      open={open}
      label={label}
      hanleConfirm={hanleConfirm}
      handleClose={handleClose}
      loading={isFetching || isUpdating}
      isUpdate={isUpdate}
      inputs={inputs}
      formik={formik}
    />
  );
}
