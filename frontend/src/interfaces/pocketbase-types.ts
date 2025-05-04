/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
  Clients = "clients",
  ExpenseConcepts = "expenseConcepts",
  Expenses = "expenses",
  Invoices = "invoices",
  InvoicesItems = "invoices_items",
  InvoicesPayments = "invoices_payments",
  MeasureUnits = "measureUnits",
  PaymentMethods = "paymentMethods",
  Products = "products",
  ProductsStores = "products_stores",
  Roles = "roles",
  Stores = "stores",
  Users = "users",
  VInvoices = "v_invoices",
  XDeleted = "x_deleted",
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type ClientsRecord = {
  address?: string;
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  name: string;
  phone?: string;
  updated_by?: RecordIdString;
};

export type ExpenseConceptsRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  detail?: string;
  name: string;
  unit_price?: number;
  updated_by?: RecordIdString;
};

export type ExpensesRecord = {
  amount?: number;
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  detail?: string;
  expense_concept: RecordIdString;
  product?: RecordIdString;
  total?: number;
  unit_price?: number;
  updated_by?: RecordIdString;
};

export type InvoicesRecord = {
  client: RecordIdString;
  created_by?: RecordIdString;
  date: IsoDateString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  discount?: number;
  store: RecordIdString;
  total?: number;
  updated_by?: RecordIdString;
};

export type InvoicesItemsRecord = {
  amount?: number;
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  discount?: number;
  invoice: RecordIdString;
  product: RecordIdString;
  total?: number;
  unit_price?: number;
  updated_by?: RecordIdString;
};

export type InvoicesPaymentsRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  invoice: RecordIdString;
  payment_method: RecordIdString;
  total?: number;
  updated_by?: RecordIdString;
};

export type MeasureUnitsRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  name?: string;
  updated_by?: RecordIdString;
};

export type PaymentMethodsRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  name: string;
  updated_by?: RecordIdString;
};

export type ProductsRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  measure_unit: RecordIdString;
  name: string;
  unit_price?: number;
  updated_by?: RecordIdString;
};

export type ProductsStoresRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  product: RecordIdString;
  stock?: number;
  store: RecordIdString;
  updated_by?: RecordIdString;
};

export type RolesRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  name: string;
  updated_by?: RecordIdString;
};

export type StoresRecord = {
  created_by?: RecordIdString;
  deleted?: IsoDateString;
  deleted_by?: RecordIdString;
  name?: string;
  updated_by?: RecordIdString;
};

export type UsersRecord = {
  role: RecordIdString;
  store: RecordIdString;
};

export type VInvoicesRecord<
  Tclient = unknown,
  Tinvoice_items = unknown,
  Tinvoice_payments = unknown,
  Tpaid = unknown,
  Tstore = unknown
> = {
  client?: null | Tclient;
  date: IsoDateString;
  deleted?: IsoDateString;
  discount?: number;
  invoice_items?: null | Tinvoice_items;
  invoice_payments?: null | Tinvoice_payments;
  paid?: null | Tpaid;
  store?: null | Tstore;
  total?: number;
};

export type XDeletedRecord<Trecord = unknown> = {
  collection?: string;
  deleted_by?: RecordIdString;
  record?: null | Trecord;
};

// Response types include system fields and match responses from the PocketBase API
export type ClientsResponse<Texpand = unknown> = Required<ClientsRecord> &
  BaseSystemFields<Texpand>;
export type ExpenseConceptsResponse<Texpand = unknown> =
  Required<ExpenseConceptsRecord> & BaseSystemFields<Texpand>;
export type ExpensesResponse<Texpand = unknown> = Required<ExpensesRecord> &
  BaseSystemFields<Texpand>;
export type InvoicesResponse<Texpand = unknown> = Required<InvoicesRecord> &
  BaseSystemFields<Texpand>;
export type InvoicesItemsResponse<Texpand = unknown> =
  Required<InvoicesItemsRecord> & BaseSystemFields<Texpand>;
export type InvoicesPaymentsResponse<Texpand = unknown> =
  Required<InvoicesPaymentsRecord> & BaseSystemFields<Texpand>;
export type MeasureUnitsResponse<Texpand = unknown> =
  Required<MeasureUnitsRecord> & BaseSystemFields<Texpand>;
export type PaymentMethodsResponse<Texpand = unknown> =
  Required<PaymentMethodsRecord> & BaseSystemFields<Texpand>;
export type ProductsResponse<Texpand = unknown> = Required<ProductsRecord> &
  BaseSystemFields<Texpand>;
export type ProductsStoresResponse<Texpand = unknown> =
  Required<ProductsStoresRecord> & BaseSystemFields<Texpand>;
export type RolesResponse<Texpand = unknown> = Required<RolesRecord> &
  BaseSystemFields<Texpand>;
export type StoresResponse<Texpand = unknown> = Required<StoresRecord> &
  BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>;
export type VInvoicesResponse<
  Tclient = unknown,
  Tinvoice_items = unknown,
  Tinvoice_payments = unknown,
  Tpaid = unknown,
  Tstore = unknown,
  Texpand = unknown
> = Required<
  VInvoicesRecord<Tclient, Tinvoice_items, Tinvoice_payments, Tpaid, Tstore>
> &
  BaseSystemFields<Texpand>;
export type XDeletedResponse<Trecord = unknown, Texpand = unknown> = Required<
  XDeletedRecord<Trecord>
> &
  BaseSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  clients: ClientsRecord;
  expenseConcepts: ExpenseConceptsRecord;
  expenses: ExpensesRecord;
  invoices: InvoicesRecord;
  invoices_items: InvoicesItemsRecord;
  invoices_payments: InvoicesPaymentsRecord;
  measureUnits: MeasureUnitsRecord;
  paymentMethods: PaymentMethodsRecord;
  products: ProductsRecord;
  products_stores: ProductsStoresRecord;
  roles: RolesRecord;
  stores: StoresRecord;
  users: UsersRecord;
  v_invoices: VInvoicesRecord;
  x_deleted: XDeletedRecord;
};

export type CollectionResponses = {
  clients: ClientsResponse;
  expenseConcepts: ExpenseConceptsResponse;
  expenses: ExpensesResponse;
  invoices: InvoicesResponse;
  invoices_items: InvoicesItemsResponse;
  invoices_payments: InvoicesPaymentsResponse;
  measureUnits: MeasureUnitsResponse;
  paymentMethods: PaymentMethodsResponse;
  products: ProductsResponse;
  products_stores: ProductsStoresResponse;
  roles: RolesResponse;
  stores: StoresResponse;
  users: UsersResponse;
  v_invoices: VInvoicesResponse;
  x_deleted: XDeletedResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: "clients"): RecordService<ClientsResponse>;
  collection(
    idOrName: "expenseConcepts"
  ): RecordService<ExpenseConceptsResponse>;
  collection(idOrName: "expenses"): RecordService<ExpensesResponse>;
  collection(idOrName: "invoices"): RecordService<InvoicesResponse>;
  collection(idOrName: "invoices_items"): RecordService<InvoicesItemsResponse>;
  collection(
    idOrName: "invoices_payments"
  ): RecordService<InvoicesPaymentsResponse>;
  collection(idOrName: "measureUnits"): RecordService<MeasureUnitsResponse>;
  collection(idOrName: "paymentMethods"): RecordService<PaymentMethodsResponse>;
  collection(idOrName: "products"): RecordService<ProductsResponse>;
  collection(
    idOrName: "products_stores"
  ): RecordService<ProductsStoresResponse>;
  collection(idOrName: "roles"): RecordService<RolesResponse>;
  collection(idOrName: "stores"): RecordService<StoresResponse>;
  collection(idOrName: "users"): RecordService<UsersResponse>;
  collection(idOrName: "v_invoices"): RecordService<VInvoicesResponse>;
  collection(idOrName: "x_deleted"): RecordService<XDeletedResponse>;
};
