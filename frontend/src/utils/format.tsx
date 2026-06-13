import { NULL_VAL } from "src/constants";
import { FORM_VLDN } from "./FormUtils";
import { Box, Chip } from "@mui/material";

// dates
export const formatDate = (str: Date | string) => {
  if (typeof str === "string") {
    const dateOnlyMatch = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return `${day}/${month}/${year.slice(2)}`;
    }
  }

  const date = new Date(str);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(2);
  return `${day}/${month}/${year}`;
};

export const formatTime = (str: Date | string) => {
  const date = new Date(str);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// string formats
export const removeSpace = (str: string) => {
  str = str.replace(" ", "");
  return str;
};

export const removeExtraSpace = (str: string) => {
  if (str.length === 1) {
    // not allow two consecutive spaces
    str = str.replace(/\s/g, "");
  } else {
    // not allow spaces at beginnign
    str = str.replace(/ +(?= )/g, "");
  }
  return str;
};

export const formatNulls = (value: any) => {
  if (value === "" || value === null) {
    value = NULL_VAL;
  }
  return value;
};

export const formatDecimal = (
  num: number | undefined,
  fractionDigits: number,
) => {
  if (isNaN(Number(num)) || (!num && num !== 0)) {
    return "NaN";
  }

  return Number(num).toFixed(fractionDigits).replace(".", ",");
};

export const formatMoney = (num: number | undefined) => {
  if (isNaN(Number(num)) || (!num && num !== 0)) {
    return "NaN";
  }
  const value = Number(num);
  return `$ ${formatMoneyAmount(value)}`;
};

export const formatMoneyAmount = (num: number | undefined) => {
  if (isNaN(Number(num)) || (!num && num !== 0)) {
    return "NaN";
  }

  const value = Number(num);
  return Number.isInteger(value) ? String(value) : formatDecimal(value, 2);
};

export const MoneyValue = ({ value }: { value: number | undefined }) => (
  <Box
    component="span"
    sx={{
      display: "inline-grid",
      gridTemplateColumns: "14px minmax(0, 1fr)",
      columnGap: 0.75,
      alignItems: "baseline",
      minWidth: 86,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    <Box component="span" sx={{ textAlign: "center" }}>
      $
    </Box>
    <Box component="span" sx={{ textAlign: "right" }}>
      {formatMoneyAmount(value)}
    </Box>
  </Box>
);

export const formatPercent = (num: number | undefined) => {
  if (isNaN(Number(num)) || (!num && num !== 0)) {
    return "NaN";
  }
  const value = Number(num);
  const hasDecimals = value % 1 !== 0;
  return `${hasDecimals ? formatDecimal(value, 2) : value}%`;
};

export const formatPaid = (total: number, paid: number) => {
  return (
    <Chip
      variant="outlined"
      size="small"
      sx={{ border: "1px solid" }}
      color={paid === 0 ? "error" : paid < total ? "warning" : "success"}
      label={formatMoney(paid)}
    />
  );
};

// validation
export const isValidNumber = (value: number | undefined): boolean => {
  return (
    value !== undefined &&
    value <= FORM_VLDN.NN_REAL_NUMBER.max &&
    value >= FORM_VLDN.NN_REAL_NUMBER.min
  );
};

// table
export const renderValue = (value: any) =>
  typeof value === "string"
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;
