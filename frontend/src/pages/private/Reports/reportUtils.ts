import dayjs, { Dayjs } from "dayjs";
import { ProductsResponse, VInvoicesResponse } from "src/types/pocketbase-types";

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

const stateLabelByName: Record<string, string> = {
  open: "Confirmada",
  draft: "Borrador",
  void: "Cancelada",
};

export const parseJsonValue = <T,>(value: unknown): T | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as T;
  return null;
};

export const toNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

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

  if (typeof stateValue === "string") {
    const parsedState = parseJsonValue<{ name?: string }>(stateValue);
    const stateName = parsedState?.name || stateValue;
    return String(stateName || "").toLowerCase();
  }

  if (stateValue && typeof stateValue === "object" && "name" in stateValue) {
    const stateName = (stateValue as { name?: unknown }).name;
    return typeof stateName === "string" ? stateName.toLowerCase() : "";
  }

  return "";
};

export const getStateLabel = (invoice: VInvoicesResponse) => {
  const stateName = getInvoiceStateValue(invoice);
  return stateLabelByName[stateName] || stateName || "-";
};

export const getInvoiceDateIso = (invoiceDate: string) => {
  if (!invoiceDate) return "";
  const raw = String(invoiceDate).trim();
  const leadingDateMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (leadingDateMatch) return leadingDateMatch[0];
  return normalizeIsoDate(raw);
};

export const getClientName = (invoice: VInvoicesResponse) => {
  const clientValue = invoice.client;

  if (typeof clientValue === "string") {
    const parsed = parseJsonValue<{ name?: string }>(clientValue);
    return parsed?.name || clientValue || "-";
  }

  if (clientValue && typeof clientValue === "object" && "name" in clientValue) {
    const clientName = (clientValue as { name?: unknown }).name;
    return typeof clientName === "string" ? clientName : "-";
  }

  return "-";
};

export const formatPickerDate = (value: Dayjs | null) =>
  value ? value.format("YYYY-MM-DD") : "";

export const parsePickerDate = (value: string) => (value ? dayjs(value) : null);

export const formatQuantity = (amount: number) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

export const getProductTypeIds = (product: ProductsResponse) =>
  (Array.isArray(product.product_type) ? product.product_type : [])
    .map((typeId) => String(typeId || "").trim())
    .filter((typeId) => Boolean(typeId));

export const roundPrice = (value: number) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;
