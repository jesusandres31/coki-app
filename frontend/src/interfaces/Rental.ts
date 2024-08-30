import { Ball, BaseItem, Client, Field, Json, PaymentMethod } from ".";

// view
export interface RentalView {
  id: string;
  location: string;
  client: Json;
  field: Json;
  ball: Json;
  started_at: Date;
  hours: NumberOrEmpty;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
  paid: NumberOrEmpty;
  rental_payments: RentalPaymentView[];
}

export interface RentalPaymentView {
  id: string;
  payment_method_id: string;
  payment_method_name: string;
  total: NumberOrEmpty;
}

// rentals
export interface Rental
  extends BaseItem<{ client: Client; field: Field; ball: Ball }>,
    GetRentalRes {}

export interface CreateRentalReq extends GetRentalRes {
  rental_payments: CreateRentalPaymentReq[];
}

export interface GetRentalRes {
  client: string;
  field: string;
  ball: string;
  started_at: Date;
  hours: NumberOrEmpty;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
}

// rentals_payments
export interface RentalPayment
  extends BaseItem<{ rental: Rental; payment_method: PaymentMethod }>,
    CreateRentalPaymentReq {}

export interface CreateRentalPaymentReq {
  rental: string;
  payment_method: string;
  total: NumberOrEmpty;
}
