import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { key } from "src/config";
import { Order } from "src/types";
import { ls } from "src/utils/localStorage";

const baseQuery = fetchBaseQuery({});

/**
 * API definitions
 */
export const ApiTag = {
  Users: "users",
  Stores: "stores",
  Expenses: "expenses",
  ExpenseConcepts: "expenseConcepts",
  Products: "products",
  ProductsStores: "products_stores",
  Clients: "clients",
  PaymentMethods: "paymentMethods",
  Invoices: "invoices",
  InvoiceItem: "invoices_items",
  InvoicePayment: "invoice_payment",
};

export const ApiView = {
  Invoices: "v_invoices",
};

export const mainApi = createApi({
  baseQuery,
  tagTypes: Object.values(ApiTag),
  endpoints: () => ({}),
  keepUnusedDataFor: 30,
});

/**
 * Utils
 */
export const pbSort = (order: Order | undefined, orderBy: string | undefined) =>
  order && orderBy ? `${order === "asc" ? "+" : "-"}${orderBy}` : "";

export const pbFilter = (filter: string | undefined, props: string[]) => {
  if (!filter) return `deleted = ""`;
  return `(${props
    .map((prop) => `${prop} ~ "${filter}"`)
    .join(" || ")}) && deleted = ""`;
};

// flags
export const FLAG = {
  // sending this object to the backend will mark the item as deleted
  delete: { delete: true },
  // tag used when updating the default caneen
  refetch: ApiTag.Users,
};

// to be used in querys to filter by the current store
export const getCurrent = {
  Store: () => ` && store.id = '${ls.get(key.STORE)}'`,
};
