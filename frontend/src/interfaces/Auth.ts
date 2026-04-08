import { BaseSystemFields } from "../types/pocketbase-types";
import { Role } from "./Role";

export interface SignUpResponse extends BaseSystemFields {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  expand?: {
    role?: Role;
  };
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface Token {
  exp: number;
  sub: string;
}
