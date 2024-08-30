import { PromiseStatus } from "src/types";
import { expenseConceptApi } from "src/app/services/expenseConceptService";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";

interface DeleteExpenseConceptsProps {
  open: boolean;
  label: string;
}

export default function DeleteExpenseConcepts({
  open,
  label,
}: DeleteExpenseConceptsProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteExpenseConcept, { isLoading: isDeleting }] =
    expenseConceptApi.useDeleteExpenseConceptMutation();

  const handleDelete = async () => {
    const res = await deleteExpenseConcept(selectedItems).unwrap();
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
