import { PaymentMethod, Invoice } from ".";
import { InvoicesPaymentsResponse } from "./pocketbase-types";

export type InvoicePayment = InvoicesPaymentsResponse<{
  invoice: Invoice;
  payment_method: PaymentMethod;
}>;

export type CreateInvoicePaymentReq = Pick<
  InvoicePayment,
  "invoice" | "payment_method" | "total"
>;
