import {
  Store,
  Client,
  CreateInvoicePaymentReq,
  CreateInvoiceItemReq,
} from ".";
import {
  ClientsResponse,
  InvoicesResponse,
  StoresResponse,
  VInvoicesResponse,
} from "./pocketbase-types";

// invoices
export type Invoice = InvoicesResponse<{ client: Client; store: Store }>;

export type CreateInvoiceReq = Pick<
  Invoice,
  "client" | "store" | "date" | "discount" | "total"
> & {
  invoice_payments: CreateInvoicePaymentReq[];
  invoice_items: CreateInvoiceItemReq[];
};

// view
interface InvoicePaymentViewProp {
  id: string;
  payment_method_id: string;
  payment_method_name: string;
  total: number;
}

interface InvoiceItemViewProp {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  amount: number;
  discount: number;
  total: number;
}

export type InvoiceView = VInvoicesResponse<
  ClientsResponse,
  InvoiceItemViewProp[],
  InvoicePaymentViewProp[],
  number,
  StoresResponse
>;

export type InvoiceViewDetails = InvoicePaymentViewProp & InvoiceItemViewProp;
