import {
  BaseItem,
  CreatePaymentMethodReq,
  PaymentMethod,
  Product,
  Store,
  Client,
  Json,
} from ".";

// view
export interface InvoiceView {
  id: string;
  client: Json;
  store: Json;
  date: Date;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
  paid: NumberOrEmpty;
  invoice_payments: InvoicePaymentView[];
  invoice_items: InvoiceItemView[];
}

export interface InvoicePaymentView {
  id: string;
  payment_method_id: string;
  payment_method_name: string;
  total: NumberOrEmpty;
}

export interface InvoiceItemView {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: NumberOrEmpty;
  amount: NumberOrEmpty;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
}

// invoices
export interface Invoice extends BaseItem<{ client: Client; store: Store }> {
  client: string;
  store: string;
  date: Date;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
}

export type CreateInvoiceReq = Pick<
  Invoice,
  "client" | "store" | "date" | "discount" | "total"
> & {
  invoice_payments: CreatePaymentMethodReq[];
  invoice_items: CreateInvoiceItemReq[];
};

export type GetInvoiceRes = Pick<
  Invoice,
  "client" | "store" | "date" | "discount" | "total"
>;

// invoices_items
export interface InvoiceItem
  extends BaseItem<{ invoice: Invoice; product: Product }> {
  invoice: string;
  product: string;
  unit_price: NumberOrEmpty;
  amount: NumberOrEmpty;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
}

export type CreateInvoiceItemReq = Pick<
  InvoiceItem,
  "invoice" | "product" | "unit_price" | "amount" | "discount" | "total"
>;

// invoices_payments
export interface InvoicePayment
  extends BaseItem<{ invoice: Invoice; payment_method: PaymentMethod }> {
  invoice: string;
  payment_method: string;
  total: NumberOrEmpty;
}

export type CreateInvoicePaymentReq = Pick<
  InvoicePayment,
  "invoice" | "payment_method" | "total"
>;
