import { SerializedError } from "@reduxjs/toolkit";
import { FetchArgs, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import {
  BaseQueryFn,
  FetchBaseQueryError,
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { ListResult } from "pocketbase";
import {
  ExpenseConcept,
  Expense,
  Client,
  Product,
  Field,
  Rental,
  Ball,
  PaymentMethod,
  RentalPayment,
  RentalView,
  ProductCanteen,
} from "src/interfaces";
import {
  Invoice,
  InvoiceView,
  InvoiceItem,
  InvoicePayment,
} from "src/interfaces/Invoice";

/**
 * table
 */
export interface IColumn<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: "right" | "left";
  render?: (item: T) => JSX.Element | string | null;
  tooltip?: (item: T) => JSX.Element | string | null;
  disableSort?: boolean;
}

export interface IDetailColumn<T, U> {
  id: keyof U;
  columns: IColumn<T>[];
  title?: string;
}

export type Order = "asc" | "desc";

/**
 * Modal and DataGrid configuration
 */
export type Action = "create" | "update" | "delete";

export interface IMenuItem {
  text?: string;
  icon?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  nestedItems?: IMenuItem[];
}

export interface DrawerSection {
  title?: string;
  menuItems: IMenuItem[];
}

export type GetList = {
  page: number;
  perPage: number;
  filter?: string;
  order?: Order;
  orderBy?: string;
  currentCanteen?: string;
};

/**
 * Promise settled statuses
 */
export enum PromiseStatus {
  FULFILLED = "fulfilled",
  REJECTED = "rejected",
}

/**
 * form
 */
export interface Input {
  hide?: boolean;
  required: boolean;
  label: string;
  id: string;
  value: any;
  error: string | string[] | undefined;
  max?: number;
  min?: number;
  multiline?: boolean;
  InputProps?: {
    inputComponent: React.ComponentType<any>;
    startAdornment?: JSX.Element;
  };
  options?: Item[];
  fetchItemsFunc?: FetchItemsFunc;
  loading?: boolean;
  getOptionLabel?: (option: Item) => string;
  startValue?: Item | Item[];
  capitalize?: boolean;
  noSpace?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  triggerSideEffect?: (data: Item) => void;
}

/**
 * DataGrid
 */
type RTKQueryFetchFn<T> = (
  arg: T,
  preferCacheValue?: boolean | undefined
) => QueryActionCreatorResult<
  QueryDefinition<
    T,
    BaseQueryFn<
      string | FetchArgs,
      unknown,
      FetchBaseQueryError,
      {},
      FetchBaseQueryMeta
    >,
    string,
    ListResult<any>,
    "api"
  >
>;

export type FetchItemsFunc = RTKQueryFetchFn<GetList>;

export type DataGridData = ListResult<Item> | undefined;

export type DataGridError = FetchBaseQueryError | SerializedError | undefined;

export type IHandleFetchItems = (data: GetList) => Promise<void>;

/**
 * DataGrid entities
 */
export type Entity =
  | "user"
  | "expenses"
  | "expenseConcepts"
  | "products"
  | "products_canteens"
  | "clients"
  | "fields"
  | "rentals"
  | "rentals_payments"
  | "v_rentals"
  | "balls"
  | "paymentMethods"
  | "invoices"
  | "invoices_items"
  | "invoices_payments"
  | "v_invoices";

// all the app entities goes here
export type Item =
  | Expense
  | ExpenseConcept
  | Product
  | ProductCanteen
  | Client
  | Field
  | Rental
  | RentalPayment
  | RentalView
  | Ball
  | PaymentMethod
  | Invoice
  | InvoiceItem
  | InvoicePayment
  | InvoiceView;

// we have to create this Type due to this error message:
// "The expected type comes from property 'columns' which is declared here on type 'IntrinsicAttributes & DataGridProps'."
export type Column =
  | IColumn<Item>[]
  | IColumn<ExpenseConcept>[]
  | IColumn<Product>[]
  | IColumn<Client>[]
  | IColumn<Field>[]
  | IColumn<Rental>[]
  | IColumn<RentalPayment>[]
  | IColumn<RentalView>[]
  | IColumn<Ball>[]
  | IColumn<PaymentMethod>[]
  | IColumn<Invoice>[]
  | IColumn<InvoiceItem>[]
  | IColumn<InvoicePayment>[]
  | IColumn<InvoiceView>[]
  | IColumn<ProductCanteen>[];

// any is used because the type of the columns is different for each entity
export type DetailColumn = IDetailColumn<any, any>[];
