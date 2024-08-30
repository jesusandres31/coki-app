import { BaseItem } from ".";

export interface Client extends BaseItem<{}>, CreateClientReq {}

export interface CreateClientReq {
  name: string;
  phone: string;
}
