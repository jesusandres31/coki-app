export interface DeliveryListPdfItem {
  id: string;
  productName: string;
  measureUnitName: string;
  amount: string;
}

export interface DeliveryListPdfModel {
  selectedDaysText: string;
  generatedAt: string;
  items: DeliveryListPdfItem[];
  totalAmount: string;
}

export interface PriceListPdfItem {
  id: string;
  productName: string;
  measureUnitName: string;
  unitPrice: string;
}

export interface PriceListPdfModel {
  generatedAt: string;
  items: PriceListPdfItem[];
  totalItems: number;
}
