import React from "react";
import { Alert, Snackbar } from "@mui/material";
import { resetSnackbar, useUISelector } from "src/slices/ui/uiSlice";
import { useAppDispatch } from "src/app/store";

export default function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const { snackbar } = useUISelector((state) => state.ui);

  const handleClose = (e: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(resetSnackbar());
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.type}
        variant="filled"
        sx={{ width: "100%", color: "white" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
