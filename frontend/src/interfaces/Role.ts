import { RolesResponse } from "./pocketbase-types";

export type Role = RolesResponse;

export type UpsertRoleReq = Pick<Role, "name">;
