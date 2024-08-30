import { PromiseStatus } from "src/types";
import { ballApi } from "src/app/services/ballService";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";

interface DeleteBallsProps {
  open: boolean;
  label: string;
}

export default function DeleteBalls({ open, label }: DeleteBallsProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteBall, { isLoading: isDeleting }] =
    ballApi.useDeleteBallMutation();

  const handleDelete = async () => {
    const res = await deleteBall(selectedItems).unwrap();
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
