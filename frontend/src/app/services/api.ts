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
  Invoices: "invoices",
  InvoicesProducts: "invoices_products",
  InvoicesView: "v_invoices",
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

export const pbFilter = (filter: string | undefined, props: string[]) => {
  if (!filter) return `deleted = ""`;
  const safeFilter = filter
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .trim();

  if (!safeFilter) return `deleted = ""`;

  return `(${props
    .map((prop) => `${prop} ~ "${safeFilter}"`)
    .join(" || ")}) && deleted = ""`;
};

// flags
export const FLAG = {
  // sending this object to the backend will mark the item as deleted
  delete: { delete: true },
  // tag used when updating the default caneen
  refetch: ApiTag.Users,
};
