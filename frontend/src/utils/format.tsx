import { NULL_VAL } from "src/constants";
import { VLDN } from "./FormUtils";
import { Chip } from "@mui/material";

// dates
export const formatDate = (str: Date | string) => {
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

export const formatMoney = (num: number | undefined) => {
  if (isNaN(Number(num)) || !num) {
    return "NaN";
  }
  const hasDecimals = Number(num) % 1 !== 0;
  const formatStyle = hasDecimals ? "2-digit" : "0-digit";
  const formatOptions = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: formatStyle === "2-digit" ? 2 : 0,
    maximumFractionDigits: formatStyle === "2-digit" ? 2 : 0,
    useGrouping: false,
  };
  const formattedPrice = num.toLocaleString("en-US", formatOptions as any);
  return formattedPrice;
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
    value < VLDN.NN_REAL_NUMBER.max &&
    value > VLDN.NN_REAL_NUMBER.min
  );
};

// table
export const renderValue = (value: any) =>
  typeof value === "string"
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;
