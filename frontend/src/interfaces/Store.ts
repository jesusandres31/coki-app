import { StoresResponse } from "./pocketbase-types";

export type Store = StoresResponse;

export type CreateStoreReq = Pick<Store, "name">;
