import { useFormik } from "formik";
import { UpsertUserReq } from "src/interfaces";
import * as Yup from "yup";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import { useAppDispatch } from "src/app/store";
import { setSnackbar } from "src/slices/uiSlice";
import { userApi } from "src/app/services/userService";
import { Input } from "src/types";
import { useAuth } from "src/hooks";
import { useEffect } from "react";

interface UpdateUserPsswdProps {
  open: boolean;
  handleClose: () => void;
}

export default function UpdateUserPsswd({
  open,
  handleClose,
}: UpdateUserPsswdProps) {
  const dispatch = useAppDispatch();
  const { authUser, handleSignOut } = useAuth();
  const [updateUser, { isLoading: isUpdating }] =
    userApi.useUpdateUserMutation();

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

  const _handleClose = () => {
    handleClose();
    formik.resetForm();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      oldPassword: "",
      password: "",
      passwordConfirm: "",
    },
    onSubmit: async (values) => {
      try {
        if (authUser) {
          // Create a proper UpsertUserReq by including the required fields
          const data: UpsertUserReq = {
            role: authUser.role,
            username: authUser.username,
            email: authUser.email,
            oldPassword: values.oldPassword,
            password: values.password,
            passwordConfirm: values.passwordConfirm,
          };
          await updateUser({ id: authUser.id, data }).unwrap();
          dispatch(setSnackbar({ message: FORM_MSG.changePsswd }));
          handleSignOut();
          handleClose();
        }
      } catch (err) {
        throw err;
      }
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.PSSWD.min, FORM_MSG.minLength(FORM_VLDN.PSSWD.min))
        .max(FORM_VLDN.PSSWD.max, FORM_MSG.maxLength(FORM_VLDN.PSSWD.max)),
      password: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.PSSWD.min, FORM_MSG.minLength(FORM_VLDN.PSSWD.min))
        .max(FORM_VLDN.PSSWD.max, FORM_MSG.maxLength(FORM_VLDN.PSSWD.max)),
      passwordConfirm: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.PSSWD.min, FORM_MSG.minLength(FORM_VLDN.PSSWD.min))
        .max(FORM_VLDN.PSSWD.max, FORM_MSG.maxLength(FORM_VLDN.PSSWD.max)),
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
      max: FORM_VLDN.LONG_STRING.max,
      min: FORM_VLDN.LONG_STRING.min,
      noSpace: true,
      capitalize: false,
    },
    {
      required: true,
      label: "Nueva Contraseña",
      id: "password",
      value: formik.values.password,
      error: formik.errors.password,
      max: FORM_VLDN.LONG_STRING.max,
      min: FORM_VLDN.LONG_STRING.min,
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
          ? FORM_MSG.passwordConfirm
          : undefined),
      max: FORM_VLDN.LONG_STRING.max,
      min: FORM_VLDN.LONG_STRING.min,
      noSpace: true,
      capitalize: false,
    },
  ];

  return (
    <CreateOrUpdateModal
      open={open}
      hanleConfirm={hanleConfirm}
      handleClose={_handleClose}
      loading={isUpdating}
      isUpdate={true}
      inputs={inputs}
      formik={formik}
      title="Restablecer Contraseña"
      confBtnLabel="Confirmar"
      noCancelBtn
      variant="standard"
    />
  );
}
