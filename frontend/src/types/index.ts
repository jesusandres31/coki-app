import { SerializedError } from "@reduxjs/toolkit";
import { FetchArgs, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import {
  BaseQueryFn,
  FetchBaseQueryError,
  QueryActionCreatorResult,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { ListResult } from "pocketbase";
import { CollectionResponses } from "src/types/pocketbase-types";

/**
 * table
 */
export interface IColumn<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: "right" | "left";
  render?: (item: T) => JSX.Element | string | null | undefined;
  tooltip?: (item: T) => JSX.Element | string | null | undefined;
  disableSort?: boolean;
  disableEdit?: boolean;
  type?: "number" | "text" | "date";
}

export interface IDetailColumn<T, U> {
  id: keyof U;
  columns: IColumn<T>[];
  title?: string;
}

export type Order = "asc" | "desc";

/**
 * DataGrid configuration
 */

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
  options?: DataItem[];
  fetchItemsFunc?: FetchItemsFunc;
  loading?: boolean;
  getOptionLabel?: (option: DataItem) => string;
  startValue?: DataItem | DataItem[];
  capitalize?: boolean;
  noSpace?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  type?: string;
  autoComplete?: string;
  triggerSideEffect?: (data: DataItem) => void;
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

export type DataGridData = ListResult<DataItem> | undefined;

export type DataGridError = FetchBaseQueryError | SerializedError | undefined;

export type IHandleFetchItems = (data: GetList) => Promise<void>;

/**
 * DataGrid entities
 */
type ValueOf<T> = T[keyof T];

export type DataItem = ValueOf<CollectionResponses>;

export type Column = IColumn<any>[];

export type DetailColumn = IDetailColumn<any, any>[];

export interface DataGridRowAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (item: DataItem) => void;
}

