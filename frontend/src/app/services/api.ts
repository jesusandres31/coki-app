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
  Locations: "locations",
  Canteens: "canteens",
  Expenses: "expenses",
  ExpenseConcepts: "expenseConcepts",
  Products: "products",
  ProductsCanteens: "products_canteens",
  Clients: "clients",
  Fields: "fields",
  Balls: "balls",
  Rentals: "rentals",
  RentalsPayments: "rentals_payments",
  PaymentMethods: "paymentMethods",
  Invoices: "invoices",
  InvoiceItem: "invoices_items",
  InvoicePayment: "invoice_payment",
};

export const ApiView = {
  Invoices: "v_invoices",
  Rentals: "v_rentals",
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

// to be used in querys to filter by the current canteen
export const getCurrent = {
  Location: () => ` && location = '${ls.get(key.LOCATION)}'`,
  Canteen: () => ` && canteen.id = '${ls.get(key.CANTEEN)}'`,
};
