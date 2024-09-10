import { Item } from "src/types";

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
