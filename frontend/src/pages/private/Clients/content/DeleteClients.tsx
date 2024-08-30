import { PromiseStatus } from "src/types";
import { clientApi } from "src/app/services/clientService";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";

interface DeleteClientsProps {
  open: boolean;
  label: string;
}

export default function DeleteClients({ open, label }: DeleteClientsProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteClient, { isLoading: isDeleting }] =
    clientApi.useDeleteClientMutation();

  const handleDelete = async () => {
    const res = await deleteClient(selectedItems).unwrap();
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
