import { Expense } from "src/interfaces";
import { IColumn } from "src/types";
import DataGrid from "src/components/common/DataGrid/DataGrid";
import { expenseApi } from "src/app/services/expenseService";
import { formatDate, formatMoney } from "src/utils/format";
import { useUISelector } from "src/slices/ui/uiSlice";
import DeleteExpenses from "./content/DeleteExpenses";
import CreateOrUpdateExpense from "./content/CreateOrUpdateExpense";
import { Collections } from "src/interfaces/pocketbase-types";

const COLUMNS: IColumn<Expense>[] = [
  {
    minWidth: 150,
    label: "Concepto",
    id: "expense_concept",
    render: (item) => item.expand?.expense_concept.name || "",
    align: "left",
  },
  {
    minWidth: 150,
    label: "Detalle",
    id: "detail",
    align: "left",
  },
  {
    minWidth: 100,
    label: "Cantidad",
    id: "amount",
  },
  {
    minWidth: 100,
    label: "Precio Unit.",
    id: "unit_price",
    render: (item) => formatMoney(item.unit_price),
  },
  {
    minWidth: 100,
    label: "Total",
    id: "total",
    render: (item) => formatMoney(item.total),
  },
  {
    minWidth: 100,
    label: "Fecha Creación",
    id: "created",
    render: (item) => formatDate(item.created),
  },
];

const DEFAULT_ORDER_BY: keyof Expense = "created";

const ENTITY = Collections.Expenses;

export default function Expenses() {
  const { actionModal, selectedItems } = useUISelector((state) => state.ui);
  const [getExpenses, { data, isFetching, error }] =
    expenseApi.useLazyGetExpensesQuery();

  const MODAL = {
    create: actionModal.create === ENTITY,
    update: actionModal.update === ENTITY,
    delete: actionModal.delete === ENTITY,
    label: selectedItems.length > 1 ? "Egresos" : "Egreso",
  };

  return (
    <>
      <DataGrid
        data={data}
        error={error}
        isFetching={isFetching}
        columns={COLUMNS}
        defaultOrderBy={DEFAULT_ORDER_BY}
        fetchItemsFunc={getExpenses}
        entity={ENTITY}
      />
      <DeleteExpenses open={MODAL.delete} label={MODAL.label} />
      <CreateOrUpdateExpense
        open={MODAL.create || MODAL.update}
        label={MODAL.label}
      />
    </>
  );
}
