import { Store } from "./Store";
import { BaseItem } from "./utils";

export interface SignUpRes extends BaseItem<{ store: Store }>, SignInReq {
  id: string;
  username: string;
  email: string;
  role: string;
  store: string;
}

export interface SignInReq {
  email: string;
  password: string;
}

export interface Token {
  exp: number;
  sub: string;
}
