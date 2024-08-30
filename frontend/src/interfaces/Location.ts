import { BaseItem } from ".";

export interface Location extends BaseItem<{}>, CreateLocationReq {}

export interface CreateLocationReq {
  name: string;
}
