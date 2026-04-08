import { BaseSystemFields } from "../types/pocketbase-types";

export interface SignUpResponse extends BaseSystemFields {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface Token {
  exp: number;
  sub: string;
}
