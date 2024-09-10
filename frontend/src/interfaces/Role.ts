import { BaseItem } from ".";

export interface Role extends BaseItem<{}> {
  name: string;
}

export type UpsertRoleReq = Pick<Role, "name">;
