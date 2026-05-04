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

interface CustomMultipleAutocompleteProps {
  input: Input;
  formik: FormikProps<any>;
  options: DataItem[];
  fetchItemsFunc?: FetchItemsFunc;
  loading?: boolean;
  getOptionLabel?: (option: DataItem) => string;
  variant?: TextFieldVariants;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

export default function CustomMultipleAutocomplete({
  input,
  formik,
  fetchItemsFunc,
  options,
  loading,
  getOptionLabel,
  variant = "outlined",
  fullWidth = false,
  sx,
}: CustomMultipleAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);

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
    if (input.startValue) setSelectedItems(input.startValue as DataItem[]);
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
    _event: React.ChangeEvent<{}>,
    filter: string | null,
    reason: AutocompleteInputChangeReason
  ) => {
    // handle filter
    if (reason === "reset") return;
    if (reason === "clear") {
      handleSetFilter("");
      formik.setFieldValue(input.id, []);
      setSelectedItems([]);
    }
    if (typeof filter === "string") {
      handleSetFilter(filter);
    }
    formik.setErrors({});
  };

  const handleChange = (_event: React.ChangeEvent<{}>, data: DataItem[]) => {
    setSelectedItems(data);
    formik.setFieldValue(input.id, data.map((row) => row.id));
    formik.setErrors({});
  };

  return (
    <>
      <Autocomplete
        multiple
        fullWidth={fullWidth}
        sx={{
          width: fullWidth ? "100%" : { xs: "100%", sm: STYLE.width.textfield },
          ...sx,
        }}
        limitTags={3}
        size="small"
        disabled={input.disabled}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        value={selectedItems}
        onChange={handleChange}
        onInputChange={handleInputChange}
        isOptionEqualToValue={(option, value) => {
          if (option && option.id && value && value.id)
            return option.id === value.id;
          return false;
        }}
        getOptionLabel={getOptionLabel}
        options={options}
        loading={loading}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
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
    </>
  );
}
