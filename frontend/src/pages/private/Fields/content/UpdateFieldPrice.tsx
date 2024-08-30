import { useFormik } from "formik";
import { UpdateFieldReq } from "src/interfaces";
import * as Yup from "yup";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { MSG, NumericFormatFloat, VLDN } from "src/utils/FormUtils";
import { useAppDispatch } from "src/app/store";
import {
  closeModal,
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import { fieldApi } from "src/app/services/fieldService";
import { Input } from "src/types";
import { useEffect } from "react";
import { useModal } from "src/hooks";
import { InputAdornment } from "@mui/material";

interface UpdateFieldPriceProps {
  open: boolean;
  label: string;
}

export default function UpdateFieldPrice({
  open,
  label,
}: UpdateFieldPriceProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [updateField, { isLoading: isUpdating }] =
    fieldApi.useUpdateFieldMutation();
  const [getField, { isFetching }] = fieldApi.useLazyGetFieldQuery();
  const { isUpdate } = useModal();

  const handleGetField = async (id: string) => {
    try {
      const payload = await getField(id).unwrap();
      formik.setValues({
        location: payload.location,
        name: payload.name,
        price_per_hour: payload.price_per_hour,
      });
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (isUpdate) {
      handleGetField(selectedItems[0]);
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
      location: "",
      name: "",
      price_per_hour: "",
    },
    onSubmit: async (data: UpdateFieldReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          const res = await updateField({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate(res.name) }));
        }
        handleClose();
      } catch (err) {
        throw err;
      }
      dispatch(resetSelectedItems());
    },
    validationSchema: Yup.object({
      price_per_hour: Yup.string()
        .required(MSG.required)
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max)),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  const inputs: Input[] = [
    {
      required: false,
      label: "Precio por Hora",
      id: "price_per_hour",
      value: formik.values.price_per_hour,
      error: formik.errors.price_per_hour,
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
      loading={isFetching || isUpdating}
      isUpdate={isUpdate}
      inputs={inputs}
      formik={formik}
    />
  );
}
