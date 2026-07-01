import { NULL_VAL } from "src/constants";
import { FORM_VLDN } from "./FormUtils";
import { Box, Chip } from "@mui/material";

// dates
const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const utcDateAtMidnightPattern =
  /^(\d{4})-(\d{2})-(\d{2})[ T]00:00(?::00(?:\.000)?)?Z?$/;

const formatDateParts = (year: string, month: string, day: string) =>
  `${day}/${month}/${year.slice(2)}`;

export const formatDate = (str: Date | string) => {
  if (typeof str === "string") {
    const value = str.trim();
    const dateOnlyMatch = value.match(dateOnlyPattern);
    const utcDateAtMidnightMatch = value.match(utcDateAtMidnightPattern);
    const calendarDateMatch = dateOnlyMatch || utcDateAtMidnightMatch;

    if (calendarDateMatch) {
      const [, year, month, day] = calendarDateMatch;
      return formatDateParts(year, month, day);
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

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(num));
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
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
};

export const MoneyValue = ({ value }: { value: number | undefined }) => {
  if (isNaN(Number(value)) || (!value && value !== 0)) {
    return <>{NULL_VAL}</>;
  }

  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        minWidth: "max-content",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      $ {formatMoneyAmount(value)}
    </Box>
  );
};

export const formatPercent = (num: number | undefined) => {
  if (isNaN(Number(num)) || (!num && num !== 0)) {
    return "NaN";
  }
  const value = Number(num);
  const hasDecimals = value % 1 !== 0;
  return `${hasDecimals ? formatDecimal(value, 2) : formatMoneyAmount(value)}%`;
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
