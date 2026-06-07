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
  const { open, setOpen, handleTextInputChange } =
    useRemoteAutocomplete(fetchItemsFunc);
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);

  useEffect(() => {
    if (input.startValue) setSelectedItems(input.startValue as DataItem[]);
  }, [input.startValue]);

  const handleInputChange = (
    _event: React.ChangeEvent<{}>,
    filter: string | null,
    reason: AutocompleteInputChangeReason
  ) => {
    handleTextInputChange(filter, reason, () => {
      formik.setFieldValue(input.id, []);
      setSelectedItems([]);
    });
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
        sx={getAutocompleteWidthSx(fullWidth, sx)}
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
        isOptionEqualToValue={isAutocompleteOptionEqual}
        getOptionLabel={getOptionLabel}
        getOptionKey={(option) => option.id}
        options={options}
        loading={loading}
        renderOption={(props, option) =>
          renderAutocompleteOption(props, option, getOptionLabel)
        }
        renderInput={(params) => (
          renderAutocompleteInput({ params, input, loading, variant, fullWidth })
        )}
      />
    </>
  );
}
