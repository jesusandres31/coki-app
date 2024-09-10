import { BaseItem } from ".";

export interface Store extends BaseItem<{}> {
  name: string;
}

export type CreateStoreReq = Pick<Store, "name">;
