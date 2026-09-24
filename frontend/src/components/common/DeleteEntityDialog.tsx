import ConfirmationDialog from "./ConfirmationDialog";

interface DeleteEntityDialogProps {
  open: boolean;
  title: string;
  message: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteEntityDialog({
  open,
  title,
  message,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteEntityDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title={title}
      message={message}
      loading={isDeleting}
      confirmColor="error"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
