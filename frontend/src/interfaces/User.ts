import { BaseItem, Role } from ".";

export interface User extends BaseItem<{ role: Role }>, UpsertUserReq {}

export interface UpsertUserReq {
  role?: string;
  username?: string;
  email?: string;
  store?: string;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}
