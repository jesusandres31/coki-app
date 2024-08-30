import { InputAdornment } from "@mui/material";
import { useFormik } from "formik";
import { CreateRentalReq } from "src/interfaces";
import * as Yup from "yup";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { MSG, VLDN, NumericFormatFloat } from "src/utils/FormUtils";
import { useAppDispatch } from "src/app/store";
import {
  closeModal,
  resetSelectedItems,
  setSnackbar,
  uiInitialState,
  useUISelector,
} from "src/slices/ui/uiSlice";
import { rentalApi } from "src/app/services/rentalService";
import { Input } from "src/types";
import { useEffect } from "react";
import { clientApi } from "src/app/services/clientService";
import { fieldApi } from "src/app/services/fieldService";
import { ballApi } from "src/app/services/ballService";
import { useModal } from "src/hooks";

interface CreateOrUpdateRentalProps {
  open: boolean;
  label: string;
}

export default function CreateOrUpdateRental({
  open,
  label,
}: CreateOrUpdateRentalProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [createRental, { isLoading: isCreating }] =
    rentalApi.useCreateRentalMutation();
  const [updateRental, { isLoading: isUpdating }] =
    rentalApi.useUpdateRentalMutation();
  const [getRental, { data: rental, isFetching }] =
    rentalApi.useLazyGetRentalQuery();
  const [getClients, { data: clients, isFetching: isFetchingClients }] =
    clientApi.useLazyGetClientsQuery();
  const [getFields, { data: fields, isFetching: isFetchingFields }] =
    fieldApi.useLazyGetFieldsQuery();
  const [getBalls, { data: balls, isFetching: isFetchingBalls }] =
    ballApi.useLazyGetBallsQuery();
  const { isUpdate } = useModal();

  const handleGetExpense = async (id: string) => {
    try {
      const payload = await getRental(id).unwrap();
      formik.setValues({
        client: payload.client.id,
        field: payload.field.id,
        ball: payload.ball.id,
        started_at: payload.started_at,
        hours: payload.hours,
        total: payload.total,
        discount: payload.discount,
        rental_payments: payload.rental_payments.map((item) => ({
          rental: payload.id,
          payment_method: item.payment_method_id,
          total: item.total,
        })),
      });
    } catch (err) {
      throw err;
    }
  };

  const handleGetClients = async () => {
    try {
      await getClients({
        page: uiInitialState.page,
        perPage: uiInitialState.perPage,
        filter: uiInitialState.filter,
        order: uiInitialState.order,
        orderBy: uiInitialState.orderBy,
      }).unwrap();
    } catch (err) {
      throw err;
    }
  };

  const handleGetFields = async () => {
    try {
      await getFields({
        page: uiInitialState.page,
        perPage: uiInitialState.perPage,
        filter: uiInitialState.filter,
        order: uiInitialState.order,
        orderBy: uiInitialState.orderBy,
      }).unwrap();
    } catch (err) {
      throw err;
    }
  };

  const handleGetBalls = async () => {
    try {
      await getBalls({
        page: uiInitialState.page,
        perPage: uiInitialState.perPage,
        filter: uiInitialState.filter,
        order: uiInitialState.order,
        orderBy: uiInitialState.orderBy,
      }).unwrap();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    handleGetClients();
    handleGetFields();
    handleGetBalls();
  }, []);

  useEffect(() => {
    if (isUpdate) {
      handleGetExpense(selectedItems[0]);
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
      client: "",
      field: "",
      ball: "",
      started_at: new Date(),
      hours: "",
      discount: 0,
      total: 0,
      rental_payments: [],
    },
    onSubmit: async (data: CreateRentalReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          await updateRental({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate() }));
        } else {
          await createRental(data).unwrap();
          dispatch(setSnackbar({ message: MSG.successCreate() }));
        }
        handleClose();
      } catch (err) {
        throw err;
      }
      dispatch(resetSelectedItems());
    },
    validationSchema: Yup.object({
      client: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      field: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      ball: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      started_at: Yup.date().required(MSG.required),
      hours: Yup.number()
        .required(MSG.required)
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max)),
      total: Yup.number()
        .required(MSG.required)
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max)),
      rental_payments: Yup.array().required(MSG.required),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  const inputs: Input[] = [
    {
      required: true,
      label: "Cliente",
      id: "client",
      value: formik.values.client,
      error: formik.errors.client,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
      options: clients ? clients.items : [],
      fetchItemsFunc: getClients,
      loading: isFetchingClients,
      getOptionLabel: (option) => ("name" in option ? option.name : ""),
      /* startValue: isUpdate && rental ? rental.client : undefined, */
    },
    {
      required: true,
      label: "Cancha",
      id: "field",
      value: formik.values.field,
      error: formik.errors.field,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
      options: fields ? fields.items : [],
      fetchItemsFunc: getFields,
      loading: isFetchingFields,
      getOptionLabel: (option) => ("name" in option ? option.name : ""),
      /* startValue: isUpdate && rental ? rental.field : undefined, */
    },
    {
      required: true,
      label: "Pelota",
      id: "ball",
      value: formik.values.ball,
      error: formik.errors.ball,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
      options: balls ? balls.items : [],
      fetchItemsFunc: getBalls,
      loading: isFetchingBalls,
      getOptionLabel: (option) => ("name" in option ? option.name : ""),
      /* startValue: isUpdate && rental ? rental.ball : undefined, */
    },
    {
      required: false,
      label: "Detalle",
      id: "detail",
      value: formik.values.detail,
      error: formik.errors.detail,
      multiline: true,
      max: VLDN.LONG_STRING.max,
      min: VLDN.LONG_STRING.min,
    },
    {
      required: true,
      label: "Cantidad",
      id: "amount",
      value: formik.values.amount,
      error: formik.errors.amount,
      max: VLDN.REAL_NUMBER.max,
      min: VLDN.REAL_NUMBER.min,
      InputProps: {
        inputComponent: NumericFormatFloat as any,
      },
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
    {
      required: true,
      label: "Total",
      id: "total",
      value: formik.values.total,
      error: formik.errors.total,
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
