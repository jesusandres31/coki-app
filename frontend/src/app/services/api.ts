import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Order } from "src/types";

const baseQuery = fetchBaseQuery({});

/**
 * API definitions
 */
export const ApiTag = {
  Users: "users",
  Clients: "clients",
  Products: "products",
  ProductTypes: "product_types",
  Configs: "configs",
  MeasureUnits: "measureunits",
  Invoices: "invoices",
  InvoicesProducts: "invoices_products",
  InvoicesView: "v_invoices",
  InvoiceStates: "invoicestates",
  PaymentAccountMovements: "payment_account_movements",
  PaymentAccountMovementTypes: "payment_account_movement_types",
};

export const ApiView = {};

export const mainApi = createApi({
  baseQuery,
  tagTypes: Object.values(ApiTag),
  endpoints: () => ({}),
  keepUnusedDataFor: 30,
});

/**
 * Utils
 */
export const pbSort = (
  order: Order | undefined,
  orderBy: string | undefined,
) => (order && orderBy ? `${order === "asc" ? "+" : "-"}${orderBy}` : "");

export const activeRecordFilter = `deleted = ""`;

export const withActiveRecordFilter = (filter?: string) =>
  filter ? `(${filter}) && ${activeRecordFilter}` : activeRecordFilter;

export const pbFilter = (filter: string | undefined, props: string[]) => {
  if (!filter) return activeRecordFilter;
  const safeFilter = filter
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .trim();

  if (!safeFilter) return activeRecordFilter;

  return withActiveRecordFilter(
    props.map((prop) => `${prop} ~ "${safeFilter}"`).join(" || "),
  );
};

// flags
export const FLAG = {
  // sending this object to the backend will mark the item as deleted
  delete: { delete: true },
  // tag used when updating the default caneen
  refetch: ApiTag.Users,
};
