import { CircularProgress } from "@mui/material";
import type { InputProps as MuiInputProps } from "@mui/material/Input";

export const withLoadingInputProps = (
  inputProps: Partial<MuiInputProps> | undefined,
  loading?: boolean,
): Partial<MuiInputProps> | undefined => {
  if (!loading) return inputProps;

  return {
    ...inputProps,
    endAdornment: (
      <>
        <CircularProgress
          color="inherit"
          size={18}
          sx={{ mr: inputProps?.endAdornment ? 0.75 : 0 }}
        />
        {inputProps?.endAdornment}
      </>
    ),
  };
};
