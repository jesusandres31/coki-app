import { useFormik } from "formik";
import { CreateBallReq, Field } from "src/interfaces";
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
import { ballApi } from "src/app/services/ballService";
import { Input } from "src/types";
import { useEffect } from "react";
import { useModal } from "src/hooks";
import { fieldApi } from "src/app/services/fieldService";

interface CreateOrUpdateBallProps {
  open: boolean;
  label: string;
}

export default function CreateOrUpdateBall({
  open,
  label,
}: CreateOrUpdateBallProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [createBall, { isLoading: isCreating }] =
    ballApi.useCreateBallMutation();
  const [updateBall, { isLoading: isUpdating }] =
    ballApi.useUpdateBallMutation();
  const [getBall, { data: ball, isFetching }] = ballApi.useLazyGetBallQuery();
  const [getFields, { data: fields, isFetching: isFetchinFields }] =
    fieldApi.useLazyGetFieldsQuery();
  const { isUpdate } = useModal();

  const handleGetBall = async (id: string) => {
    try {
      const payload = await getBall(id).unwrap();
      formik.setValues({
        field: payload.expand.field.id,
        name: payload.name,
        detail: payload.detail,
      });
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (isUpdate) {
      handleGetBall(selectedItems[0]);
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
      field: "",
      name: "",
      detail: "",
    },
    onSubmit: async (data: CreateBallReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          const res = await updateBall({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate(res.name) }));
        } else {
          const res = await createBall(data).unwrap();
          dispatch(setSnackbar({ message: MSG.successCreate(res.name) }));
        }
        handleClose();
      } catch (err) {
        throw err;
      }
      dispatch(resetSelectedItems());
    },
    validationSchema: Yup.object({
      field: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      name: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      detail: Yup.string()
        .min(VLDN.LONG_STRING.min, MSG.minLength(VLDN.LONG_STRING.min))
        .max(VLDN.LONG_STRING.max, MSG.maxLength(VLDN.LONG_STRING.max)),
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
      required: false,
      label: "Detalle",
      id: "detail",
      value: formik.values.detail,
      error: formik.errors.detail,
      max: VLDN.LONG_STRING.max,
      min: VLDN.LONG_STRING.min,
    },
    {
      required: true,
      label: "Concepto",
      id: "field",
      value: formik.values.field,
      error: formik.errors.field,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
      options: fields ? fields.items : [],
      fetchItemsFunc: getFields,
      loading: isFetchinFields,
      getOptionLabel: (option) => ("name" in option ? option.name : ""),
      startValue: isUpdate && ball ? ball.expand.field : undefined,
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
