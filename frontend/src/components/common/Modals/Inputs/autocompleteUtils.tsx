import {
  AutocompleteInputChangeReason,
  AutocompleteRenderInputParams,
  CircularProgress,
  SxProps,
  TextField,
  TextFieldVariants,
  Theme,
  debounce,
} from "@mui/material";
import { Key, useCallback, useEffect, useState } from "react";
import { STYLE } from "src/constants";
import { uiInitialState } from "src/slices/uiSlice";
import { DataItem, FetchItemsFunc, Input } from "src/types";

export const getAutocompleteWidthSx = (
  fullWidth: boolean,
  sx?: SxProps<Theme>,
) => ({
  width: fullWidth ? "100%" : { xs: "100%", sm: STYLE.width.textfield },
  ...sx,
});

export const isAutocompleteOptionEqual = (
  option: DataItem,
  value: DataItem,
) => {
  if (option && option.id && value && value.id) return option.id === value.id;
  return false;
};

export const renderAutocompleteOption = (
  props: React.HTMLAttributes<HTMLLIElement> & { key?: Key },
  option: DataItem,
  getOptionLabel?: (option: DataItem) => string,
) => {
  const { key: _key, ...optionProps } = props;

  return (
    <li key={option.id} {...optionProps}>
      {getOptionLabel && getOptionLabel(option)}
    </li>
  );
};

export const renderAutocompleteInput = ({
  params,
  input,
  loading,
  variant,
  fullWidth,
}: {
  params: AutocompleteRenderInputParams;
  input: Input;
  loading?: boolean;
  variant: TextFieldVariants;
  fullWidth: boolean;
}) => (
  <TextField
    {...params}
    required={input.required}
    label={input.label}
    id={input.id}
    name={input.id}
    value={input.value}
    autoComplete="off"
    error={!!input.error}
    helperText={input.error ? input.error : " "}
    sx={getAutocompleteWidthSx(fullWidth)}
    size="small"
    variant={variant}
    disabled={input.disabled}
    InputProps={{
      ...params.InputProps,
      endAdornment: (
        <>
          {loading ? (
            <CircularProgress size={20} sx={{ color: "common.black" }} />
          ) : null}
          {params.InputProps.endAdornment}
        </>
      ),
    }}
  />
);

export const useRemoteAutocomplete = (fetchItemsFunc?: FetchItemsFunc) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const handleGetItems = async (filter: string) => {
    if (fetchItemsFunc === undefined) return;
    try {
      await fetchItemsFunc({
        filter,
        page: uiInitialState.page,
        perPage: uiInitialState.perPage,
        order: uiInitialState.order,
        orderBy: uiInitialState.orderBy,
      }).unwrap();
    } catch {
      // RTK Query middleware surfaces request errors; keep the input stable.
    }
  };

  useEffect(() => {
    void handleGetItems(filter);
  }, []);

  const debounceFetchItems = useCallback(
    debounce(async (filter: string) => {
      await handleGetItems(filter);
    }, 300),
    [],
  );

  const handleSetFilter = (filter: string) => {
    setFilter(filter);
    debounceFetchItems(filter);
  };

  const handleTextInputChange = (
    filter: string | null,
    reason: AutocompleteInputChangeReason,
    onClear: () => void,
  ) => {
    if (reason === "reset") return;
    if (reason === "clear") {
      handleSetFilter("");
      onClear();
    }
    if (typeof filter === "string") {
      handleSetFilter(filter);
    }
  };

  return {
    open,
    setOpen,
    handleTextInputChange,
  };
};
