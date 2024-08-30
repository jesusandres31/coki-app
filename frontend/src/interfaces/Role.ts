import { BaseItem } from ".";

export interface Role extends BaseItem<{}>, UpsertRoleReq {}

export interface UpsertRoleReq {
  name: string;
}
