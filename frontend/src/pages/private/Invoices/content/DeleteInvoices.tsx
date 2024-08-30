import { PromiseStatus } from "src/types";
import { useAppDispatch } from "src/app/store";
import {
  resetSelectedItems,
  setSnackbar,
  useUISelector,
} from "src/slices/ui/uiSlice";
import DeleteModal from "src/components/common/Modals/DeleteModal";
import { MSG } from "src/utils/FormUtils";
import { invoiceApi } from "src/app/services/invoiceService";

interface DeleteInvoicesProps {
  open: boolean;
  label: string;
}

export default function DeleteInvoices({ open, label }: DeleteInvoicesProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const [deleteInvoice, { isLoading: isDeleting }] =
    invoiceApi.useDeleteInvoiceMutation();

  const handleDelete = async () => {
    const res = await deleteInvoice(selectedItems).unwrap();
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
