import { PaymentMethodsResponse } from "./pocketbase-types";

export type PaymentMethod = PaymentMethodsResponse;

export type CreatePaymentMethodReq = Pick<PaymentMethod, "id" | "name">;
