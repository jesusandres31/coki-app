import { BaseItem } from ".";

export interface PaymentMethod extends BaseItem<{}>, CreatePaymentMethodReq {}

export interface CreatePaymentMethodReq {
  id: string;
  name: string;
}
