import { BaseItem } from ".";

export interface Store extends BaseItem<{}>, CreateStoreReq {}

export interface CreateStoreReq {
  name: string;
}
