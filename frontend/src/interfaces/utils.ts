/**
 * api
 */
// export interface Error {
//   message: string;
//   code: number;
// }

import { Item } from "src/types";

// export interface StreamRes<T> {
//   [key: string]: T;
// }

/**
 * base interfaces
 */
export interface BaseItem<Expand> {
  id: string;
  created: Date;
  expand: Expand;
}

export interface UpdateItemReq<T> {
  id: string;
  data: T;
}

export interface DeleteItemReq {
  id: string;
  dependants?: {
    collection: string;
    items: Item[];
  };
}

export interface Json {
  id: string;
  name: string;
}
