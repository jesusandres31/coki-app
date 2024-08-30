import { PromiseStatus } from "src/types";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";
import { expenseApi } from "src/app/services/expenseService";

interface DeleteExpensesProps {
  open: boolean;
  label: string;
}

export default function DeleteExpenses({ open, label }: DeleteExpensesProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteExpense, { isLoading: isDeleting }] =
    expenseApi.useDeleteExpenseMutation();

  const handleDelete = async () => {
    const res = await deleteExpense(selectedItems).unwrap();
    if (res.every((item) => item.status === PromiseStatus.FULFILLED)) {
      dispatch(resetSelectedItems());
      dispatch(setSnackbar({ message: MSG.successDelete(res.length) }));
    }
  };

  return (
    <DeleteModal
      open={open}
      label={label}
      hanleConfirm={handleDelete}
      isDeleting={isDeleting}
    />
  );
}
