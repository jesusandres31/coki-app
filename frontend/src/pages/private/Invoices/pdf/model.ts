export interface InvoicePdfItem {
  id: string;
  productName: string;
  measureUnitName: string;
  amount: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface InvoicePdfModel {
  invoiceId: string;
  date: string;
  clientName: string;
  stateLabel: string;
  discountPercent: number;
  subtotal: number;
  total: number;
  items: InvoicePdfItem[];
}
