import dayjs from "dayjs";
import {
  MeasureunitsResponse,
  ProductsResponse,
  VInvoicesResponse,
} from "src/types/pocketbase-types";
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

const stateLabelByName: Record<string, string> = {
  open: "Confirmada",
  draft: "Borrador",
  void: "Cancelada",
};

const parseJsonValue = <T,>(value: unknown): T | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as T;
  return null;
};

const clampDiscount = (value: number) => Math.min(100, Math.max(0, value));
const toNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getItemTotal = (item: {
  amount: number;
  unitPrice: number;
  discount: number;
}) =>
  Math.max(
    0,
    item.amount * item.unitPrice * (1 - clampDiscount(item.discount) / 100),
  );

const getStateLabel = (stateValue: unknown) => {
  if (typeof stateValue === "string") {
    const parsedState = parseJsonValue<{ name?: string }>(stateValue);
    const stateName = (parsedState?.name || stateValue).toLowerCase();
    return stateLabelByName[stateName] || stateName || "-";
  }

  if (stateValue && typeof stateValue === "object" && "name" in stateValue) {
    const stateName = String((stateValue as { name?: unknown }).name || "")
      .toLowerCase()
      .trim();
    return stateLabelByName[stateName] || stateName || "-";
  }

  return "-";
};

const getClientName = (clientValue: unknown) => {
  if (typeof clientValue === "string") {
    const parsedClient = parseJsonValue<{ name?: string }>(clientValue);
    return parsedClient?.name || clientValue || "-";
  }

  if (clientValue && typeof clientValue === "object" && "name" in clientValue) {
    const clientName = (clientValue as { name?: unknown }).name;
    return typeof clientName === "string" ? clientName : "-";
  }

  return "-";
};

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
    clientName: getClientName(invoice.client),
    stateLabel: getStateLabel(
      (invoice as VInvoicesResponse & { state?: unknown }).state,
    ),
    discountPercent,
    subtotal,
    total,
    items,
  };
};
