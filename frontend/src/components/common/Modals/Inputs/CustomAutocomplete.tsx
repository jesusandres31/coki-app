import {
  Autocomplete,
  AutocompleteInputChangeReason,
  CircularProgress,
  SxProps,
  TextField,
  TextFieldVariants,
  Theme,
  debounce,
} from "@mui/material";
import { FormikProps } from "formik";
import { STYLE } from "src/constants";
import { uiInitialState } from "src/slices/uiSlice";
import { FetchItemsFunc, Input, DataItem } from "src/types";
import { useCallback, useEffect, useState } from "react";

interface CustomAutocompleteProps {
  input: Input;
  formik: FormikProps<any>;
  options?: DataItem[];
  fetchItemsFunc?: FetchItemsFunc;
  loading?: boolean;
  getOptionLabel?: (option: DataItem) => string;
  variant?: TextFieldVariants;
  triggerSideEffect?: (data: DataItem) => void;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

export default function CustomAutocomplete({
  input,
  formik,
  fetchItemsFunc,
  options,
  loading,
  getOptionLabel,
  variant = "outlined",
  triggerSideEffect,
  fullWidth = false,
  sx,
}: CustomAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

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
    setSelectedItem(input.startValue as DataItem);
  }, [input.startValue]);

  useEffect(() => {
    void handleGetItems(filter);
  }, []);

  const debounceFetchItems = useCallback(
    debounce(async (filter: string) => {
      await handleGetItems(filter);
    }, 300),
    []
  );

  const handleSetFilter = async (filter: string) => {
    setFilter(filter);
    debounceFetchItems(filter);
  };

  const handleInputChange = (
    e: React.ChangeEvent<{}>,
    filter: string | null,
    reason: AutocompleteInputChangeReason
  ) => {
    // handle filter
    if (reason === "reset") return;
    if (reason === "clear") {
      handleSetFilter("");
      formik.setFieldValue(input.id, "");
      setSelectedItem(null);
    }
    if (typeof filter === "string") {
      handleSetFilter(filter);
    }
  };

  const handleChange = (e: React.ChangeEvent<{}>, data: DataItem | null) => {
    if (data) {
      formik.setFieldValue(input.id, data.id);
      setSelectedItem(data);
      if (triggerSideEffect) triggerSideEffect(data);
    }
  };

  return (
    <Autocomplete
      fullWidth={fullWidth}
      sx={{
        width: fullWidth ? "100%" : { xs: "100%", sm: STYLE.width.textfield },
        ...sx,
      }}
      disabled={input.disabled}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      value={selectedItem ?? null}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option, value) => {
        if (option && option.id && value && value.id)
          return option.id === value.id;
        return false;
      }}
      getOptionLabel={getOptionLabel}
      getOptionKey={(option) => option.id}
      options={options ?? []}
      loading={loading}
      renderOption={(props, option) => {
        const { key: _key, ...optionProps } = props;

        return (
          <li key={option.id} {...optionProps}>
            {getOptionLabel && getOptionLabel(option)}
          </li>
        );
      }}
      renderInput={(params) => (
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
          sx={{
            width: fullWidth
              ? "100%"
              : { xs: "100%", sm: STYLE.width.textfield },
          }}
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
      )}
    />
  );
}
