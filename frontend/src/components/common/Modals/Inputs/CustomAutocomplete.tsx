import {
  Autocomplete,
  AutocompleteInputChangeReason,
  CircularProgress,
  TextField,
  TextFieldVariants,
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
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    setSelectedItem(input.startValue as DataItem);
  }, [input.startValue]);

  useEffect(() => {
    handleGetItems(filter);
  }, []);

  const debounceFetchItems = useCallback(
    debounce(async (filter: string) => {
      handleGetItems(filter);
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
      sx={{ width: { xs: "100%", sm: STYLE.width.textfield } }}
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
      options={options ?? []}
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
          sx={{ width: { xs: "100%", sm: STYLE.width.textfield } }}
          size="small"
          variant={variant}
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
