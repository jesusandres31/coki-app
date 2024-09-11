import { Product, Invoice } from ".";
import { InvoicesItemsResponse } from "./pocketbase-types";

export type InvoiceItem = InvoicesItemsResponse<{
  invoice: Invoice;
  product: Product;
}>;

export type CreateInvoiceItemReq = Pick<
  InvoiceItem,
  "invoice" | "product" | "unit_price" | "amount" | "discount" | "total"
>;
