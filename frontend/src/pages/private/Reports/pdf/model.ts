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

