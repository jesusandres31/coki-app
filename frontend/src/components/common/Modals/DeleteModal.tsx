import {
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Dialog,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useAppDispatch } from "src/app/store";
import { closeModal, useUISelector } from "src/slices/ui/uiSlice";

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

  const handleClose = () => dispatch(closeModal());

  const handleDelete = async () => {
    await hanleConfirm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{`Eliminar ${label}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`Si eliminas ${isMoreThanOne ? "los siguientes" : "el siguiente"} 
          item${isMoreThanOne ? "s" : ""}, no podrás recuperarlo.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <LoadingButton
          loading={isDeleting}
          onClick={handleDelete}
          autoFocus
          /* color="secondary" */
          variant="contained"
        >
          Eliminar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
