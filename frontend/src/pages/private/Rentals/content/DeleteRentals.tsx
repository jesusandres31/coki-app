import { PromiseStatus } from "src/types";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";
import { rentalApi } from "src/app/services/rentalService";

interface DeleteRentalsProps {
  open: boolean;
  label: string;
}

export default function DeleteRentals({ open, label }: DeleteRentalsProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteRental, { isLoading: isDeleting }] =
    rentalApi.useDeleteRentalMutation();

  const handleDelete = async () => {
    const res = await deleteRental(selectedItems).unwrap();
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
