import { BaseSystemFields } from "./pocketbase-types";
import { Store } from "./Store";

export interface SignUpResponse extends BaseSystemFields<{ store: Store }> {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  store: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface Token {
  exp: number;
  sub: string;
}
