import { useMemo, useState } from "react";
import { EditRounded } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { getListArgsInitialState } from "src/constants";
import {
  useGetClientsListQuery,
  useUpdateClientMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { setSnackbar } from "src/slices/uiSlice";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import { ClientsResponse } from "src/types/pocketbase-types";
import { Column, DataGridRowAction, GetList, Input } from "src/types";

interface ClientFormValues {
  name: string;
  address: string;
  phone: string;
}

export default function Clients() {
  const dispatch = useAppDispatch();
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));
  const [editingClient, setEditingClient] = useState<ClientsResponse | null>(
    null,
  );

  const { data, error, isFetching } = useGetClientsListQuery(queryArgs);
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

  const formik = useFormik<ClientFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: editingClient?.name || "",
      address: editingClient?.address || "",
      phone: editingClient?.phone || "",
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
      if (!editingClient) return;

      await updateClient({
        id: editingClient.id,
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
      setEditingClient(null);
      formik.resetForm();
    },
  });

  const handleCloseModal = () => {
    setEditingClient(null);
    formik.resetForm();
  };

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Nombre",
        align: "left",
        minWidth: 220,
      },
      {
        id: "address",
        label: "Dirección",
        align: "left",
        minWidth: 260,
      },
      {
        id: "phone",
        label: "Teléfono",
        align: "left",
        minWidth: 180,
      },
    ],
    [],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "edit",
        label: "Editar",
        icon: <EditRounded fontSize="small" color="primary" />,
        onClick: (item) => setEditingClient(item as ClientsResponse),
      },
    ],
    [],
  );

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

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={columns}
        hasSearch
        searchPlaceholder="Buscar cliente"
        initialQuery={queryArgs}
        onQueryChange={setQueryArgs}
        rowActions={rowActions}
      />

      <CreateOrUpdateModal
        open={Boolean(editingClient)}
        hanleConfirm={() => void formik.submitForm()}
        handleClose={handleCloseModal}
        loading={isUpdating}
        isUpdate
        inputs={inputs}
        formik={formik}
        title="Editar cliente"
        confBtnLabel="Guardar"
      />
    </>
  );
}

