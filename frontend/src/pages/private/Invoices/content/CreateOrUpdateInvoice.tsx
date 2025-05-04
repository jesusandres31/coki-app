import { useFormik } from "formik";
import * as Yup from "yup";
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
import { useModal } from "src/hooks";
import { invoiceApi } from "src/app/services/invoiceService";
import { CreateInvoiceReq } from "src/interfaces";
import TransactionModal from "src/components/common/Modals/TransactionModal";

interface CreateOrUpdateInvoiceProps {
  open: boolean;
  label: string;
}

export default function CreateOrUpdateInvoice({
  open,
  label,
}: CreateOrUpdateInvoiceProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [createInvoice, { isLoading: isCreating }] =
    invoiceApi.useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] =
    invoiceApi.useUpdateInvoiceMutation();
  const [getInvoice, { isFetching: isFetchingInvoice }] =
    invoiceApi.useLazyGetInvoiceQuery();
  const { isUpdate } = useModal();

  const handleGetExpense = async (id: string) => {
    try {
      const payload = await getInvoice(id).unwrap();
      formik.setValues({
        client: payload.client?.id || "",
        store: payload.store?.id || "",
        date: payload.date,
        discount: payload.discount,
        total: payload.total,
        invoice_payments: payload.invoice_payments
          ? payload.invoice_payments.map((item) => ({
              total: item.total,
              invoice: item.id,
              payment_method: item.payment_method_id,
            }))
          : [],
        invoice_items: payload.invoice_items
          ? payload.invoice_items.map((item) => ({
              discount: item.discount,
              total: item.total,
              invoice: item.id,
              product: item.product_id,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          : [],
      });
    } catch (err) {
      throw err;
    }
  };

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
      store: "",
      date: "",
      discount: 0,
      total: 0,
      invoice_payments: [
        {
          total: 0,
          invoice: "",
          payment_method: "",
        },
      ],
      invoice_items: [
        {
          discount: 0,
          total: 0,
          invoice: "",
          product: "",
          unit_price: 0,
          amount: 0,
        },
      ],
    },
    onSubmit: async (data: CreateInvoiceReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          await updateInvoice({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate() }));
        } else {
          await createInvoice(data).unwrap();
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
      store: Yup.string()
        .required(MSG.required)
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      date: Yup.date().required(MSG.required).typeError(MSG.invalidDate),
      discount: Yup.number()
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max))
        .required(MSG.required),
      total: Yup.number()
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .required(MSG.required),
      invoice_payments: Yup.array()
        .of(
          Yup.object({
            total: Yup.number()
              .min(
                VLDN.NN_REAL_NUMBER.min,
                MSG.minLength(VLDN.NN_REAL_NUMBER.min)
              )
              .required(MSG.required),
            invoice: Yup.string().required(MSG.required),
            payment_method: Yup.string().required(MSG.required),
          })
        )
        .required(MSG.required),
      invoice_items: Yup.array()
        .of(
          Yup.object({
            discount: Yup.number()
              .min(
                VLDN.NN_REAL_NUMBER.min,
                MSG.minLength(VLDN.NN_REAL_NUMBER.min)
              )
              .max(
                VLDN.NN_REAL_NUMBER.max,
                MSG.maxLength(VLDN.NN_REAL_NUMBER.max)
              )
              .required(MSG.required),
            total: Yup.number()
              .min(
                VLDN.NN_REAL_NUMBER.min,
                MSG.minLength(VLDN.NN_REAL_NUMBER.min)
              )
              .required(MSG.required),
            invoice: Yup.string().required(MSG.required),
            product: Yup.string().required(MSG.required),
            unit_price: Yup.number()
              .min(
                VLDN.NN_REAL_NUMBER.min,
                MSG.minLength(VLDN.NN_REAL_NUMBER.min)
              )
              .required(MSG.required),
            amount: Yup.number()
              .min(1, MSG.minLength(1))
              .required(MSG.required),
          })
        )
        .required(MSG.required),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  const inputs: Input[] = [
    /* {
      required: true,
      label: "Concepto",
      id: "client",
      value: formik.values.client,
      error: formik.errors.client,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
      options: clients ? clients.items : [],
      fetchItemsFunc: getClients,
      loading: isFetchingClients,
      getOptionLabel: (option) => ("name" in option ? option.name : ""),
      startValue: isUpdate && invoice ? invoice.expand.client : undefined,
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
    }, */
  ];

  return (
    <TransactionModal
      open={open}
      label={label}
      hanleConfirm={hanleConfirm}
      handleClose={handleClose}
      loading={isFetchingInvoice || isCreating || isUpdating}
      isUpdate={isUpdate}
      inputs={inputs}
      formik={formik}
    />
  );
}
