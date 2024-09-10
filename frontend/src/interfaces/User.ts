import { Role } from ".";
import { UsersResponse } from "./pocketbase-types";

export interface ExtraProps {
  username?: string;
  email?: string;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}

export type User = UsersResponse<{ role: Role }> & ExtraProps;

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
