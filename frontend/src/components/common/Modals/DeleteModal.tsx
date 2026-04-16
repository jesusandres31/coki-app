import {
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Dialog,
  Button,
} from "@mui/material";
import { useAppDispatch } from "src/app/store";
import { useUISelector } from "src/slices/uiSlice";

interface DeleteModalProps {
  open: boolean;
  label?: string;
  hanleConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteModal({
  open,
  label = "Item/s",
  hanleConfirm,
  isDeleting,
}: DeleteModalProps) {
  const dispatch = useAppDispatch();
  const { selectedItems } = useUISelector((state) => state.ui);
  const isMoreThanOne = selectedItems.length > 1;

  // const handleClose = () => dispatch(closeModal());
  const handleClose = () => {};

  const handleDelete = async () => {
    await hanleConfirm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={isDeleting ? undefined : handleClose}>
      <DialogTitle>{`Eliminar ${label}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`Si eliminas ${isMoreThanOne ? "los siguientes" : "el siguiente"} 
          item${isMoreThanOne ? "s" : ""}, no podrás recuperarlo.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          sx={{ color: "text.secondary" }}
          onClick={handleClose}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          loading={isDeleting}
          disabled={isDeleting}
          onClick={handleDelete}
          autoFocus
          variant="text"
          color="inherit"
          sx={{ color: "text.secondary" }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

