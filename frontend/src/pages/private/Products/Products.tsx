import { useMemo, useState } from "react";
import { EditRounded } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import CreateOrUpdateModal from "src/components/common/Modals/CreateOrUpdateModal";
import { getListArgsInitialState } from "src/constants";
import {
  useGetMeasureUnitsQuery,
  useGetProductsListQuery,
  useUpdateProductMutation,
} from "src/app/services/invoiceService";
import { useAppDispatch } from "src/app/store";
import { setSnackbar } from "src/slices/uiSlice";
import { FORM_MSG, FORM_VLDN } from "src/utils/FormUtils";
import { formatMoney } from "src/utils/format";
import {
  MeasureunitsResponse,
  ProductsResponse,
} from "src/types/pocketbase-types";
import { Column, DataGridRowAction, GetList, Input } from "src/types";

interface ProductFormValues {
  name: string;
  unit_price: number;
  measure_unit: string;
}

export default function Products() {
  const dispatch = useAppDispatch();
  const [queryArgs, setQueryArgs] = useState<GetList>(() => ({
    ...getListArgsInitialState,
    order: "asc",
    orderBy: "name",
  }));
  const [editingProduct, setEditingProduct] = useState<ProductsResponse | null>(
    null,
  );

  const { data, error, isFetching } = useGetProductsListQuery(queryArgs);
  const { data: measureUnits = [], isFetching: isMeasureUnitsFetching } =
    useGetMeasureUnitsQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const formik = useFormik<ProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: editingProduct?.name || "",
      unit_price: Number(editingProduct?.unit_price ?? 0),
      measure_unit: String(editingProduct?.measure_unit || ""),
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(FORM_MSG.required)
        .min(FORM_VLDN.SHORT_STRING.min, FORM_MSG.minLength(3))
        .max(FORM_VLDN.SHORT_STRING.max, FORM_MSG.maxLength(100)),
      unit_price: Yup.number()
        .typeError("Ingresá un precio válido.")
        .min(FORM_VLDN.NN_REAL_NUMBER.min, "El precio no puede ser negativo.")
        .max(
          FORM_VLDN.NN_REAL_NUMBER.max,
          `El precio no puede superar ${FORM_VLDN.NN_REAL_NUMBER.max}.`,
        )
        .required(FORM_MSG.required),
      measure_unit: Yup.string().required(FORM_MSG.required),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (!editingProduct) return;

      await updateProduct({
        id: editingProduct.id,
        data: {
          name: values.name.trim(),
          unit_price: Number(values.unit_price || 0),
          measure_unit: values.measure_unit,
        },
      }).unwrap();

      dispatch(
        setSnackbar({
          message: "Producto actualizado satisfactoriamente.",
          type: "success",
        }),
      );
      setEditingProduct(null);
      formik.resetForm();
    },
  });

  const handleCloseModal = () => {
    setEditingProduct(null);
    formik.resetForm();
  };

  const measureUnitById = useMemo(
    () =>
      new Map(measureUnits.map((item) => [item.id, String(item.name || "-")])),
    [measureUnits],
  );

  const columns: Column = useMemo(
    () => [
      {
        id: "name",
        label: "Nombre",
        align: "left",
        minWidth: 220,
      },
      {
        id: "unit_price",
        label: "Precio",
        minWidth: 150,
        render: (item: ProductsResponse) => formatMoney(item.unit_price),
      },
      {
        id: "measure_unit",
        label: "Unidad de medida",
        align: "left",
        minWidth: 200,
        disableSort: true,
        render: (item: ProductsResponse) =>
          measureUnitById.get(String(item.measure_unit || "")) || "-",
      },
    ],
    [measureUnitById],
  );

  const rowActions: DataGridRowAction[] = useMemo(
    () => [
      {
        id: "edit",
        label: "Editar",
        icon: <EditRounded fontSize="small" color="primary" />,
        onClick: (item) => setEditingProduct(item as ProductsResponse),
      },
    ],
    [],
  );

  const selectedMeasureUnit =
    measureUnits.find((item) => item.id === formik.values.measure_unit) || null;

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
      required: true,
      label: "Precio unitario",
      id: "unit_price",
      value: formik.values.unit_price,
      error: formik.errors.unit_price,
      min: FORM_VLDN.NN_REAL_NUMBER.min,
      max: FORM_VLDN.NN_REAL_NUMBER.max,
      type: "number",
    },
    {
      required: true,
      label: "Unidad de medida",
      id: "measure_unit",
      value: formik.values.measure_unit,
      error: formik.errors.measure_unit,
      options: measureUnits,
      loading: isMeasureUnitsFetching,
      startValue: selectedMeasureUnit || undefined,
      getOptionLabel: (option) =>
        String((option as MeasureunitsResponse).name || ""),
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
        searchPlaceholder="Buscar producto"
        initialQuery={queryArgs}
        onQueryChange={setQueryArgs}
        rowActions={rowActions}
      />

      <CreateOrUpdateModal
        open={Boolean(editingProduct)}
        hanleConfirm={() => void formik.submitForm()}
        handleClose={handleCloseModal}
        loading={isUpdating}
        isUpdate
        inputs={inputs}
        formik={formik}
        title="Editar producto"
        confBtnLabel="Guardar"
      />
    </>
  );
}

