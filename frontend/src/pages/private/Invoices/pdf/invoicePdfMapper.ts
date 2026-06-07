import dayjs from "dayjs";
import {
  MeasureunitsResponse,
  ProductsResponse,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
import { getRecordDisplayName, parseJsonValue, toNumber } from "src/utils/data";
import { getInvoiceStateLabel } from "src/utils/invoiceState";
import { InvoicePdfItem, InvoicePdfModel } from "./model";

interface InvoiceProductRow {
  id?: string;
  product_id?: string;
  product?: { id?: string; name?: string } | string | null;
  product_name?: string;
  amount?: number;
  unit_price?: number;
  discount?: number;
  total?: number;
}

interface BuildInvoicePdfModelArgs {
  invoice: VInvoicesResponse;
  products: ProductsResponse[];
  measureUnits: MeasureunitsResponse[];
}

const clampDiscount = (value: number) => Math.min(100, Math.max(0, value));

const getItemTotal = (item: {
  amount: number;
  unitPrice: number;
  discount: number;
}) =>
  Math.max(
    0,
    item.amount * item.unitPrice * (1 - clampDiscount(item.discount) / 100),
  );

const mapInvoiceItems = (
  invoiceProducts: InvoiceProductRow[],
  products: ProductsResponse[],
  measureUnits: MeasureunitsResponse[],
) => {
  const measureUnitById = new Map(
    measureUnits.map((unit) => [unit.id, String(unit.name || "-")]),
  );
  const productById = new Map(
    products.map((product) => [product.id, product] as const),
  );

  const items: InvoicePdfItem[] = invoiceProducts.map((item, index) => {
    const productId = String(
      item.product_id ??
        (typeof item.product === "string" ? item.product : item.product?.id) ??
        "",
    );

    const productRecord = productById.get(productId);
    const amount = Math.max(1, toNumber(item.amount || 1));
    const unitPrice = Math.max(0, toNumber(item.unit_price));
    const discount = clampDiscount(toNumber(item.discount));

    return {
      id: item.id || `item-${index + 1}`,
      productName:
        item.product_name ||
        (typeof item.product === "object" ? item.product?.name : "") ||
        productRecord?.name ||
        "-",
      measureUnitName:
        measureUnitById.get(String(productRecord?.measure_unit || "")) || "-",
      amount,
      unitPrice,
      discount,
      total: Math.max(
        0,
        toNumber(item.total) || getItemTotal({ amount, unitPrice, discount }),
      ),
    };
  });

  return items;
};

export const buildInvoicePdfModel = ({
  invoice,
  products,
  measureUnits,
}: BuildInvoicePdfModelArgs): InvoicePdfModel => {
  const parsedInvoiceProducts =
    parseJsonValue<InvoiceProductRow[]>(invoice.invoice_products) || [];
  const items = Array.isArray(parsedInvoiceProducts)
    ? mapInvoiceItems(parsedInvoiceProducts, products, measureUnits)
    : [];

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const discountPercent = clampDiscount(toNumber(invoice.discount));
  const totalFromInvoice = toNumber(invoice.total);
  const total =
    totalFromInvoice > 0
      ? totalFromInvoice
      : Math.max(0, subtotal * (1 - discountPercent / 100));

  return {
    invoiceId: invoice.id,
    date: dayjs(invoice.date).isValid()
      ? dayjs(invoice.date).format("DD/MM/YYYY")
      : String(invoice.date || "-"),
    clientName: getRecordDisplayName(invoice.client),
    stateLabel: getInvoiceStateLabel(
      (invoice as VInvoicesResponse & { state?: unknown }).state,
    ),
    discountPercent,
    subtotal,
    total,
    items,
  };
};
