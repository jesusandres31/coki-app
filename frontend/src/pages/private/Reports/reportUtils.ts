import dayjs, { Dayjs } from "dayjs";
import { ProductsResponse, VInvoicesResponse } from "src/types/pocketbase-types";
import { getRecordDisplayName, parseJsonValue, toNumber } from "src/utils/data";
import { formatDecimal } from "src/utils/format";
import { getInvoiceStateLabel, getInvoiceStateName } from "src/utils/invoiceState";

export { parseJsonValue, toNumber } from "src/utils/data";

export type ReportPeriod = "week" | "month" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

export interface InvoiceProductRow {
  product_id?: string;
  product?: { id?: string; name?: string } | string | null;
  product_name?: string;
  amount?: number;
}

export const normalizeIsoDate = (value: string) => {
  if (!value) return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return "";
  return parsed.format("YYYY-MM-DD");
};

export const resolveDateRange = (from: string, to: string): DateRange | null => {
  const normalizedFrom = normalizeIsoDate(from);
  const normalizedTo = normalizeIsoDate(to);
  if (!normalizedFrom || !normalizedTo) return null;

  return normalizedFrom <= normalizedTo
    ? { from: normalizedFrom, to: normalizedTo }
    : { from: normalizedTo, to: normalizedFrom };
};

export const getTodayIso = () => dayjs().format("YYYY-MM-DD");

export const getPresetRange = (
  period: Exclude<ReportPeriod, "custom">,
): DateRange => {
  const to = dayjs();
  const from =
    period === "week" ? to.subtract(6, "day") : to.subtract(29, "day");

  return {
    from: from.format("YYYY-MM-DD"),
    to: to.format("YYYY-MM-DD"),
  };
};

export const parseInvoiceProducts = (
  invoice: VInvoicesResponse,
): InvoiceProductRow[] => {
  const parsed = parseJsonValue<unknown>(invoice.invoice_products);
  if (!parsed) return [];
  return Array.isArray(parsed) ? (parsed as InvoiceProductRow[]) : [];
};

export const getInvoiceStateValue = (invoice: VInvoicesResponse) => {
  const stateValue = (invoice as VInvoicesResponse & { state?: unknown }).state;
  return getInvoiceStateName(stateValue);
};

export const getStateLabel = (invoice: VInvoicesResponse) => {
  const stateValue = (invoice as VInvoicesResponse & { state?: unknown }).state;
  return getInvoiceStateLabel(stateValue);
};

export const getInvoiceDateIso = (invoiceDate: string) => {
  if (!invoiceDate) return "";
  const raw = String(invoiceDate).trim();
  const leadingDateMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (leadingDateMatch) return leadingDateMatch[0];
  return normalizeIsoDate(raw);
};

export const getClientName = (invoice: VInvoicesResponse) => {
  return getRecordDisplayName(invoice.client);
};

export const formatPickerDate = (value: Dayjs | null) =>
  value ? value.format("YYYY-MM-DD") : "";

export const parsePickerDate = (value: string) => (value ? dayjs(value) : null);

export const formatQuantity = (amount: number) =>
  Number.isInteger(amount) ? String(amount) : formatDecimal(amount, 3);

export const getProductTypeIds = (product: ProductsResponse) =>
  (Array.isArray(product.product_type) ? product.product_type : [])
    .map((typeId) => String(typeId || "").trim())
    .filter((typeId) => Boolean(typeId));

export const roundPrice = (value: number) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;
