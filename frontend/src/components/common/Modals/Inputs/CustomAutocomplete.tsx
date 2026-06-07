import {
  Autocomplete,
  AutocompleteInputChangeReason,
  SxProps,
  TextFieldVariants,
  Theme,
} from "@mui/material";
import { FormikProps } from "formik";
import { FetchItemsFunc, Input, DataItem } from "src/types";
import { useEffect, useState } from "react";
import {
  getAutocompleteWidthSx,
  isAutocompleteOptionEqual,
  renderAutocompleteInput,
  renderAutocompleteOption,
  useRemoteAutocomplete,
} from "./autocompleteUtils";

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
  const { open, setOpen, handleTextInputChange } =
    useRemoteAutocomplete(fetchItemsFunc);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

  useEffect(() => {
    setSelectedItem(input.startValue as DataItem);
  }, [input.startValue]);

  const handleInputChange = (
    _event: React.ChangeEvent<{}>,
    filter: string | null,
    reason: AutocompleteInputChangeReason
  ) => {
    handleTextInputChange(filter, reason, () => {
      formik.setFieldValue(input.id, "");
      setSelectedItem(null);
    });
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
      sx={getAutocompleteWidthSx(fullWidth, sx)}
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
      isOptionEqualToValue={isAutocompleteOptionEqual}
      getOptionLabel={getOptionLabel}
      getOptionKey={(option) => option.id}
      options={options ?? []}
      loading={loading}
      renderOption={(props, option) =>
        renderAutocompleteOption(props, option, getOptionLabel)
      }
      renderInput={(params) => (
        renderAutocompleteInput({ params, input, loading, variant, fullWidth })
      )}
    />
  );
}
