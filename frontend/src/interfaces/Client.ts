import { BaseItem } from ".";

export interface Client extends BaseItem<{}> {
  name: string;
  phone: string;
  address: string;
}

export type CreateClientReq = Pick<Client, "name" | "phone" | "address">;
