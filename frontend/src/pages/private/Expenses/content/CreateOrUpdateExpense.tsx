import { InputAdornment } from "@mui/material";
import { useFormik } from "formik";
import { CreateExpenseReq } from "src/interfaces";
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
import { expenseApi } from "src/app/services/expenseService";
import { Input, Item } from "src/types";
import { useEffect } from "react";
import { expenseConceptApi } from "src/app/services/expenseConceptService";
import { useModal } from "src/hooks";

interface CreateOrUpdateExpenseProps {
  open: boolean;
  label: string;
}

export default function CreateOrUpdateExpense({
  open,
  label,
}: CreateOrUpdateExpenseProps) {
  const dispatch = useAppDispatch();
  const { selectedItems, actionModal } = useUISelector((state) => state.ui);
  const [createExpense, { isLoading: isCreating }] =
    expenseApi.useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] =
    expenseApi.useUpdateExpenseMutation();
  const [getExpense, { data: expense, isFetching }] =
    expenseApi.useLazyGetExpenseQuery();
  const [
    getExpenseConcepts,
    { data: expenseConcepts, isFetching: isFetchinExpCep },
  ] = expenseConceptApi.useLazyGetExpenseConceptsQuery();
  const { isUpdate } = useModal();

  const handleGetExpense = async (id: string) => {
    try {
      const payload = await getExpense(id).unwrap();
      formik.setValues({
        expense_concept: payload.expand.expense_concept.id,
        detail: payload.detail,
        amount: payload.amount,
        unit_price: payload.unit_price,
        total: payload.total,
      });
    } catch (err) {
      throw err;
    }
  };

  const handleGetExpenseConcepts = async () => {
    try {
      await getExpenseConcepts({
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
    handleGetExpenseConcepts();
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
      expense_concept: "",
      detail: "",
      amount: 1,
      unit_price: "",
      total: "",
    },
    onSubmit: async (data: CreateExpenseReq) => {
      try {
        if (isUpdate) {
          const id = selectedItems[0];
          await updateExpense({ id, data }).unwrap();
          dispatch(setSnackbar({ message: MSG.successUpdate() }));
        } else {
          await createExpense(data).unwrap();
          dispatch(setSnackbar({ message: MSG.successCreate() }));
        }
        handleClose();
      } catch (err) {
        throw err;
      }
      dispatch(resetSelectedItems());
    },
    validationSchema: Yup.object({
      expense_concept: Yup.string()
        .required(MSG.required) // required here cause product-based expenses are handled in the products view
        .min(VLDN.SHORT_STRING.min, MSG.minLength(VLDN.SHORT_STRING.min))
        .max(VLDN.SHORT_STRING.max, MSG.maxLength(VLDN.SHORT_STRING.max)),
      detail: Yup.string()
        .min(VLDN.LONG_STRING.min, MSG.minLength(VLDN.LONG_STRING.min))
        .max(VLDN.LONG_STRING.max, MSG.maxLength(VLDN.LONG_STRING.max)),
      amount: Yup.number()
        .required(MSG.required)
        .min(VLDN.REAL_NUMBER.min, MSG.minLength(VLDN.REAL_NUMBER.min))
        .max(VLDN.REAL_NUMBER.max, MSG.maxLength(VLDN.REAL_NUMBER.max)),
      unit_price: Yup.number()
        .required(MSG.required)
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max)),
      total: Yup.number()
        .required(MSG.required)
        .min(VLDN.NN_REAL_NUMBER.min, MSG.minLength(VLDN.NN_REAL_NUMBER.min))
        .max(VLDN.NN_REAL_NUMBER.max, MSG.maxLength(VLDN.NN_REAL_NUMBER.max)),
    }),
    validateOnChange: false,
    validateOnBlur: false,
  });

  useEffect(() => {
    if (
      typeof formik.values.unit_price === "number" &&
      typeof formik.values.amount === "number"
    ) {
      formik.setFieldValue(
        "total",
        formik.values.unit_price * formik.values.amount
      );
    }
  }, [formik.values.unit_price, formik.values.amount]);

  const expenseConceptSideEffect = (data: Item) => {
    if ("unit_price" in data) {
      formik.setFieldValue("unit_price", data.unit_price);
    }
  };

  const inputs: Input[] = [
    {
      required: true,
      label: "Concepto",
      id: "expense_concept",
      value: formik.values.expense_concept,
      error: formik.errors.expense_concept,
      max: VLDN.SHORT_STRING.max,
      min: VLDN.SHORT_STRING.min,
      options: expenseConcepts ? expenseConcepts.items : [],
      fetchItemsFunc: getExpenseConcepts,
      loading: isFetchinExpCep,
      getOptionLabel: (option) => ("name" in option ? option.name : ""),
      startValue:
        isUpdate && expense ? expense.expand.expense_concept : undefined,
      triggerSideEffect: expenseConceptSideEffect,
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
      disabled: true,
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
