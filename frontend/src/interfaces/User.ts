import { BaseItem, Role } from ".";

export interface User
  extends BaseItem<{ role: Role; location: Location }>,
    UpsertUserReq {}

export interface UpsertUserReq {
  role?: string;
  username?: string;
  email?: string;
  canteen?: string;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}
