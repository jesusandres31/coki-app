import { Field } from "src/interfaces";
import { Entity, IColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { fieldApi } from "src/app/services/fieldService";
import { openModal, useUISelector } from "src/slices/ui/uiSlice";
import UpdateFieldPrice from "./content/UpdateFieldPrice";
import { formatDate, formatMoney } from "src/utils/format";
import { CustomButtonProps } from "src/components/common/DataGrid/content/utils";
import { CurrencyExchangeRounded } from "@mui/icons-material";
import { useAppDispatch } from "src/app/store";

const COLUMNS: IColumn<Field>[] = [
  {
    minWidth: 150,
    label: "Nombre",
    id: "name",
    align: "left",
  },
  {
    minWidth: 100,
    label: "Precio por Hora",
    id: "price_per_hour",
    render: (item) => formatMoney(item.price_per_hour),
  },
  {
    minWidth: 100,
    label: "Lugar",
    id: "location",
    render: (item) => item.expand.location.name,
  },
  {
    minWidth: 100,
    label: "Fecha Creación",
    id: "created",
    render: (item) => formatDate(item.created),
  },
];

const DEFAULT_ORDER_BY: keyof Field = "created";

const ENTITY: Entity = "fields";

export default function Fields() {
  const dispatch = useAppDispatch();
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getFields, { data, isFetching, error }] =
    fieldApi.useLazyGetFieldsQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Cancha" : "Canchas",
  };

  const bulkActionForOne: CustomButtonProps[] = [
    {
      text: "Actualizar precio de la cancha",
      onClick: () => dispatch(openModal({ entity: ENTITY, action: "update" })),
      icon: <CurrencyExchangeRounded />,
    },
  ];

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={COLUMNS}
        defaultOrderBy={DEFAULT_ORDER_BY}
        fetchItemsFunc={getFields}
        entity={ENTITY}
        bulkActionForOne={bulkActionForOne}
        disableCreateBtn
        disableDefaultOptBtn
      />
      <UpdateFieldPrice
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
