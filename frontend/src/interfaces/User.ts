import { BaseItem, Role } from ".";

export interface User extends BaseItem<{ role: Role }> {
  role?: string;
  username?: string;
  email?: string;
  store?: string;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}

export type UpsertUserReq = Pick<
  User,
  | "role"
  | "username"
  | "email"
  | "store"
  | "oldPassword"
  | "password"
  | "passwordConfirm"
>;
