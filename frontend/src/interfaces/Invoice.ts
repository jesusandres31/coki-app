import {
  BaseItem,
  CreatePaymentMethodReq,
  PaymentMethod,
  Product,
  Canteen,
  Client,
  Json,
} from ".";

// view
export interface InvoiceView {
  id: string;
  client: Json;
  canteen: Json;
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
export interface Invoice
  extends BaseItem<{ client: Client; canteen: Canteen }>,
    GetInvoiceRes {}

export interface CreateInvoiceReq extends GetInvoiceRes {
  invoice_payments: CreatePaymentMethodReq[];
  invoice_items: CreateInvoiceItemReq[];
}

export interface GetInvoiceRes {
  client: string;
  canteen: string;
  date: Date;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
}

// invoices_items
export interface InvoiceItem
  extends BaseItem<{ invoice: Invoice; product: Product }>,
    CreateInvoiceItemReq {}

export interface CreateInvoiceItemReq {
  invoice: string;
  product: string;
  unit_price: NumberOrEmpty;
  amount: NumberOrEmpty;
  discount: NumberOrEmpty;
  total: NumberOrEmpty;
}

// invoices_payments
export interface InvoicePayment
  extends BaseItem<{ invoice: Invoice; payment_method: PaymentMethod }>,
    CreateInvoicePaymentReq {}

export interface CreateInvoicePaymentReq {
  invoice: string;
  payment_method: string;
  total: NumberOrEmpty;
}
