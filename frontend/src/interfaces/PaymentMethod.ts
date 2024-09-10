import { BaseItem } from ".";

export interface PaymentMethod extends BaseItem<{}> {
  id: string;
  name: string;
}

export type CreatePaymentMethodReq = Pick<PaymentMethod, "id" | "name">;
