import { PaymentMethod, Product, Store, Client } from ".";
import {
  ClientsResponse,
  InvoicesItemsResponse,
  InvoicesPaymentsResponse,
  InvoicesResponse,
  StoresResponse,
  VInvoicesResponse,
} from "./pocketbase-types";

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

// invoices
export type Invoice = InvoicesResponse<{ client: Client; store: Store }>;

export type CreateInvoiceReq = Pick<
  Invoice,
  "client" | "store" | "date" | "discount" | "total"
> & {
  invoice_payments: CreateInvoicePaymentReq[];
  invoice_items: CreateInvoiceItemReq[];
};

// invoices_items
export type InvoiceItem = InvoicesItemsResponse<{
  invoice: Invoice;
  product: Product;
}>;

export type CreateInvoiceItemReq = Pick<
  InvoiceItem,
  "invoice" | "product" | "unit_price" | "amount" | "discount" | "total"
>;

// invoices_payments
export type InvoicePayment = InvoicesPaymentsResponse<{
  invoice: Invoice;
  payment_method: PaymentMethod;
}>;

export type CreateInvoicePaymentReq = Pick<
  InvoicePayment,
  "invoice" | "payment_method" | "total"
>;
