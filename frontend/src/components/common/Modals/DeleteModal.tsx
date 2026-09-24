import ConfirmationDialog from "src/components/common/ConfirmationDialog";
import { useUISelector } from "src/slices/uiSlice";

interface DeleteModalProps {
  open: boolean;
  label?: string;
  hanleConfirm: () => Promise<void>;
  isDeleting?: boolean;
  handleClose: () => void;
}

export default function DeleteModal({
  open,
  label = "Item/s",
  hanleConfirm,
  isDeleting,
  handleClose,
}: DeleteModalProps) {
  const { selectedItems } = useUISelector((state) => state.ui);
  const isMoreThanOne = selectedItems.length > 1;
  const handleDelete = async () => {
    await hanleConfirm();
    handleClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      title={`Eliminar ${label}`}
      message={`¿Confirmás eliminar ${isMoreThanOne ? "los elementos seleccionados" : "el elemento seleccionado"}?`}
      loading={isDeleting}
      confirmColor="error"
      onCancel={handleClose}
      onConfirm={handleDelete}
    />
  );
}

