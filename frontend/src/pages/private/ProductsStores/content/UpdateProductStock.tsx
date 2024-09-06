import { useFormik } from "formik";
import { CreateProductStoreReq } from "src/interfaces";
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
import { productStoreApi } from "src/app/services/productStoreService";

interface UpdateProductStockProps {
  open: boolean;
  label: string;
}

export default function UpdateProductStock({
  open,
  label,
}: UpdateProductStockProps) {
  const dispatch = useAppDispatch();
  const { currentStore } = useAuth();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [updateProductStore, { isLoading: isUpdating }] =
    productStoreApi.useUpdateProductStoreMutation();
  const [getProductStore, { isFetching }] =
    productStoreApi.useLazyGetProductStoreQuery();
  const { isUpdate } = useModal();

  const handleGetProductStore = async (id: string) => {
    try {
      const payload = await getProductStore(id).unwrap();
      formik.setValues({
        product: payload.product,
        store: payload.store,
        stock: payload.stock,
      });
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (isUpdate) {
      handleGetProductStore(selectedItems[0]);
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
      store: currentStore,
      stock: 0,
    },
    onSubmit: async (data: CreateProductStoreReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          await updateProductStore({ id, data }).unwrap();
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
