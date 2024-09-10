import { ClientsResponse } from "./pocketbase-types";

export type Client = ClientsResponse;

export type CreateClientReq = Pick<Client, "name" | "phone" | "address">;
