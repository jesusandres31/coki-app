import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from "@mui/material";

export interface ConfirmationDialogProps {
  open: boolean;
  title: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmColor?: "primary" | "success" | "error" | "warning";
  cancelLabel?: string;
  showCancel?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmationDialog({
  open,
  title,
  message,
  children,
  loading = false,
  confirmDisabled = false,
  confirmLabel = "Confirmar",
  confirmColor = "primary",
  cancelLabel = "Cancelar",
  showCancel = true,
  maxWidth = "sm",
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmLockRef = useRef(false);
  const isProcessing = loading || isConfirming;

  useEffect(() => {
    if (open) return;
    confirmLockRef.current = false;
    setIsConfirming(false);
  }, [open]);

  const handleConfirm = async () => {
    if (confirmLockRef.current || loading || confirmDisabled) return;

    confirmLockRef.current = true;
    setIsConfirming(true);

    try {
      await onConfirm();
    } finally {
      confirmLockRef.current = false;
      setIsConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onCancel}
      fullWidth
      maxWidth={maxWidth}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {message ? <DialogContentText>{message}</DialogContentText> : null}
        {children}
      </DialogContent>
      <DialogActions>
        {showCancel ? (
          <Button
            variant="text"
            color="inherit"
            sx={{ color: "text.secondary" }}
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          autoFocus
          color={confirmColor}
          variant="contained"
          onClick={() => void handleConfirm()}
          loading={isProcessing}
          disabled={isProcessing || confirmDisabled}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
