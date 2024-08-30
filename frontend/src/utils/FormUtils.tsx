import React from "react";
import { isValidNumber } from "src/utils/format";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { capitalize as capitalizeText } from "@mui/material";
import { FormikProps } from "formik";
import { removeExtraSpace } from "src/utils/format";
import { Input } from "src/types";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export const NumericFormatFloat = React.forwardRef<
  NumericFormatProps,
  CustomProps
>(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        if (isValidNumber(values.floatValue)) {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }
      }}
      valueIsNumericString
      thousandSeparator
      decimalScale={2}
      allowNegative={false}
      isAllowed={(values) => {
        return isValidNumber(values.floatValue);
      }}
    />
  );
});

export const handleSetFormikValue = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  formik: FormikProps<any>,
  input: Input
) => {
  const value = input.capitalize
    ? capitalizeText(e.target.value)
    : e.target.value;
  formik.setFieldValue(input.id, removeExtraSpace(value));
  formik.setErrors({});
};

/**
 * validations
 */
export const VLDN = {
  SHORT_STRING: { min: 3, max: 100 },
  LONG_STRING: { min: 3, max: 150 },
  NN_REAL_NUMBER: { min: 0, max: 1000000 },
  REAL_NUMBER: { min: -1000000, max: 1000000 },
  PSSWD: { min: 8, max: 72 },
};

/**
 * messages
 */
const isFew = (length: number) => (length > 1 ? "s" : "");

export const MSG = {
  required: "Required!",
  invalidEmail: "Invalid email",
  minLength: (len: number) => `Enter ${len} characters at least.`,
  maxLength: (len: number) => `Enter ${len} caracteres maximum.`,
  successDelete: (length: number) =>
    `Item${isFew(length)} eliminado${isFew(length)} satisfactoriamente.`,
  successCreate: (name?: string) =>
    `Item ${name ? name : ""} creado satisfactoriamente.`,
  successUpdate: (name?: string) =>
    `Item ${name ? name : ""} actualizado satisfactoriamente.`,
  passwordConfirm: "La contraseña no coincide.",
  changePsswd: "Contraseña actualizada satisfactoriamente.",
};
