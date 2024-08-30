import { Canteen } from "./Canteen";
import { BaseItem } from "./utils";

export interface SignUpRes extends BaseItem<{ canteen: Canteen }>, SignInReq {
  id: string;
  username: string;
  email: string;
  role: string;
  canteen: string;
}

export interface SignInReq {
  email: string;
  password: string;
}

export interface Token {
  exp: number;
  sub: string;
}
