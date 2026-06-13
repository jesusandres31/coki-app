import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteEntityDialogProps {
  open: boolean;
  title: string;
  message: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
    <Dialog open={open} onClose={isDeleting ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          sx={{ color: "text.secondary" }}
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          autoFocus
          color="error"
          variant="contained"
          onClick={onConfirm}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
