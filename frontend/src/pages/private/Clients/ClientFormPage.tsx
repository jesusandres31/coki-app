import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import {
  useCreateClientMutation,
  useDeleteClientMutation,
  useGetClientByIdQuery,
  useUpdateClientMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { AppRoutes } from "src/config";
import { useRouter } from "src/hooks";
import { resetBreadcrumbs, setBreadcrumbs, setSnackbar } from "src/slices/uiSlice";
import { Input } from "src/types";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import {
  buildDeleteHeaderAction,
  buildNameInput,
  extractApiMessage,
  renderEntityFormPage,
  renderFormPageState,
  useDetailPageMode,
} from "../formPageUtils";
import { clientsBreadcrumbFlow } from "./breadcrumbFlow";

interface ClientFormValues {
  name: string;
  address: string;
  phone: string;
}

export default function ClientFormPage() {
  const { clientId } = useParams();
  const dispatch = useAppDispatch();
  const { handleGoTo } = useRouter();
  const isNewMode = !clientId;
  const { mode, isEditMode, setEditMode, setReviewMode } =
    useDetailPageMode(isNewMode);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: client, isFetching, error } = useGetClientByIdQuery(clientId || "", {
    skip: !clientId,
  });
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();

  useEffect(() => {
    if (isNewMode) {
      dispatch(setBreadcrumbs(clientsBreadcrumbFlow.create()));
      return;
    }
    dispatch(
      setBreadcrumbs(
        clientsBreadcrumbFlow.detail(clientId || "", client?.name, isEditMode),
      ),
    );
    return () => {
      dispatch(resetBreadcrumbs());
    };
  }, [client?.name, clientId, dispatch, isEditMode, isNewMode]);

  const formik = useFormik<ClientFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: client?.name || "",
      address: client?.address || "",
      phone: client?.phone || "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.SHORT_STRING.min, FORM_MSG.minLength(3))
        .max(FORM_VLDN.SHORT_STRING.max, FORM_MSG.maxLength(100)),
      address: Yup.string().max(
        FORM_VLDN.LONG_STRING.max,
        FORM_MSG.maxLength(FORM_VLDN.LONG_STRING.max),
      ),
      phone: Yup.string().max(
        FORM_VLDN.SHORT_STRING.max,
        FORM_MSG.maxLength(FORM_VLDN.SHORT_STRING.max),
      ),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (isNewMode) {
        const created = await createClient({
          data: {
            name: values.name.trim(),
            address: values.address.trim(),
            phone: values.phone.trim(),
          },
        }).unwrap();

        dispatch(
          setSnackbar({
            message: "Cliente creado satisfactoriamente.",
            type: "success",
          }),
        );
        handleGoTo(`${AppRoutes.Clients}/${created.id}?mode=review`);
        return;
      }

      if (!clientId) return;

      await updateClient({
        id: clientId,
        data: {
          name: values.name.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Cliente actualizado satisfactoriamente.",
          type: "success",
        }),
      );
      handleGoTo(AppRoutes.Clients);
    },
  });

  const handleDelete = async () => {
    if (!clientId) return;

    try {
      await deleteClient(clientId).unwrap();
      dispatch(
        setSnackbar({
          message: "Cliente eliminado satisfactoriamente.",
          type: "success",
        }),
      );
      setDeleteDialogOpen(false);
      handleGoTo(AppRoutes.Clients);
    } catch (error) {
      dispatch(
        setSnackbar({
          message: extractApiMessage(error) || "No se pudo eliminar el cliente.",
          type: "error",
        }),
      );
    }
  };

  const reviewHeaderActions = buildDeleteHeaderAction(
    () => setDeleteDialogOpen(true),
    !isNewMode && !isEditMode,
  );

  const inputs: Input[] = [
    buildNameInput(formik.values.name, formik.errors.name),
    {
      required: false,
      label: "Dirección",
      id: "address",
      value: formik.values.address,
      error: formik.errors.address,
      max: FORM_VLDN.LONG_STRING.max,
      capitalize: true,
    },
    {
      required: false,
      label: "Teléfono",
      id: "phone",
      value: formik.values.phone,
      error: formik.errors.phone,
      max: FORM_VLDN.SHORT_STRING.max,
    },
  ];

  if (!isNewMode && isFetching) {
    return renderFormPageState("loading");
  }

  if (!isNewMode && (error || !client)) {
    return renderFormPageState("error");
  }

  return renderEntityFormPage({
    title: isNewMode
      ? "Crear cliente"
      : `Cliente "${client?.name || client?.id || ""}"`,
    mode: isNewMode ? "new" : mode,
    inputs,
    formik,
    backRoute: AppRoutes.Clients,
    handleGoTo,
    onEdit: isNewMode ? undefined : setEditMode,
    onCancelEdit: isNewMode ? undefined : setReviewMode,
    loading: isNewMode ? isCreating : isUpdating,
    headerActions: reviewHeaderActions,
    deleteDialog: {
      open: deleteDialogOpen,
      title: "Eliminar cliente",
      message: "¿Seguro que querés eliminar este cliente?",
      isDeleting,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: () => void handleDelete(),
    },
  });
}
