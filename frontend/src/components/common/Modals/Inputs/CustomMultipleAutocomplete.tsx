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
import { uiInitialState } from "src/slices/ui/uiSlice";
import { FetchItemsFunc, Input, Item } from "src/types";
import { useCallback, useEffect, useState } from "react";

interface CustomMultipleAutocompleteProps {
  input: Input;
  formik: FormikProps<Item>;
  options: Item[];
  fetchItemsFunc?: FetchItemsFunc;
  loading?: boolean;
  getOptionLabel?: (option: Item) => string;
  variant?: TextFieldVariants;
}

export default function CustomMultipleAutocomplete({
  input,
  formik,
  fetchItemsFunc,
  options,
  loading,
  getOptionLabel,
  variant = "outlined",
}: CustomMultipleAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

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
    if (input.startValue) setSelectedItems(input.startValue as Item[]);
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
      setSelectedItems([]);
    }
    if (typeof filter === "string") {
      handleSetFilter(filter);
    }
    formik.setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<{}>,
    data: Item[],
    reason: string,
    details?: any | undefined
  ) => {
    if (reason === "select-option") {
      // remove duplicates
      const sentId = details.option.Id;
      if (!!selectedItems.find((taxpayer) => taxpayer.id === sentId)) {
        data = data.filter((row) => row.id !== sentId);
      }
    }
    if (data) {
      // update hook state
      setSelectedItems(data);
      // update formik state
      const taxpayersUuid = data.map((row) => row.id);
      formik.setFieldValue(input.id, taxpayersUuid);
    }
    formik.setErrors({});
  };

  return (
    <>
      <Autocomplete
        multiple
        sx={{ width: STYLE.width.textfield }}
        limitTags={3}
        size="small"
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
            sx={{ width: STYLE.width.textfield }}
            size="small"
            variant={variant}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
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
