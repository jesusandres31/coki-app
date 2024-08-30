import { useFormik } from "formik";
import { UpsertUserReq } from "src/interfaces";
import * as Yup from "yup";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { MSG, VLDN } from "src/utils/FormUtils";
import { useAppDispatch } from "src/app/store";
import { closeModal, setSnackbar } from "src/slices/ui/uiSlice";
import { userApi } from "src/app/services/userService";
import { Input } from "src/types";
import { useAuth, useModal } from "src/hooks";
import { useEffect } from "react";

interface UpdateUserPsswdProps {
  open: boolean;
}

export default function UpdateUserPsswd({ open }: UpdateUserPsswdProps) {
  const dispatch = useAppDispatch();
  const { authUser, handleSignOut } = useAuth();
  const [updateUser, { isLoading: isUpdating }] =
    userApi.useUpdateUserMutation();
  const { isUpdate } = useModal();

  useEffect(() => {
    if (authUser) {
      formik.setValues({
        oldPassword: "",
        password: "",
        passwordConfirm: "",
      });
    }
  }, []);

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
      oldPassword: "",
      password: "",
      passwordConfirm: "",
    },
    onSubmit: async (data: UpsertUserReq) => {
      try {
        if (authUser) {
          await updateUser({ id: authUser.id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.changePsswd }));
          handleSignOut();
          handleClose();
        }
      } catch (err) {
        throw err;
      }
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string()
        .required(MSG.required)
        .min(VLDN.PSSWD.min, MSG.minLength(VLDN.PSSWD.min))
        .max(VLDN.PSSWD.max, MSG.maxLength(VLDN.PSSWD.max)),
      password: Yup.string()
        .required(MSG.required)
        .min(VLDN.PSSWD.min, MSG.minLength(VLDN.PSSWD.min))
        .max(VLDN.PSSWD.max, MSG.maxLength(VLDN.PSSWD.max)),
      passwordConfirm: Yup.string()
        .required(MSG.required)
        .min(VLDN.PSSWD.min, MSG.minLength(VLDN.PSSWD.min))
        .max(VLDN.PSSWD.max, MSG.maxLength(VLDN.PSSWD.max)),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  const inputs: Input[] = [
    {
      required: true,
      label: "Contraseña Actual",
      id: "oldPassword",
      value: formik.values.oldPassword,
      error: formik.errors.oldPassword,
      max: VLDN.LONG_STRING.max,
      min: VLDN.LONG_STRING.min,
      noSpace: true,
      capitalize: false,
    },
    {
      required: true,
      label: "Nueva Contraseña",
      id: "password",
      value: formik.values.password,
      error: formik.errors.password,
      max: VLDN.LONG_STRING.max,
      min: VLDN.LONG_STRING.min,
      noSpace: true,
      capitalize: false,
    },
    {
      required: true,
      label: "Confirmar Nueva Contraseña",
      id: "passwordConfirm",
      value: formik.values.passwordConfirm,
      error:
        formik.errors.passwordConfirm ||
        (formik.values.password !== formik.values.passwordConfirm
          ? MSG.passwordConfirm
          : undefined),
      max: VLDN.LONG_STRING.max,
      min: VLDN.LONG_STRING.min,
      noSpace: true,
      capitalize: false,
    },
  ];

  return (
    <CreateOrUpdateModal
      open={open}
      hanleConfirm={hanleConfirm}
      handleClose={handleClose}
      loading={isUpdating}
      isUpdate={isUpdate}
      inputs={inputs}
      formik={formik}
      title="Restablecer Contraseña"
      confBtnLabel="Confirmar"
      noCancelBtn
      variant="standard"
    />
  );
}
