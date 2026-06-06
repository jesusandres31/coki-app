/// <reference path="../pb_data/types.d.ts" />

const MAX_INVOICE_DISCOUNT_PERCENT = 100;
const DEFAULT_INVOICE_STATE = "open";
const INVOICE_PAYMENT_MOVEMENT_TYPE = {
  payment: "payment",
  debt: "debt",
};

const normalizeInvoiceDiscountPercent = (value) =>
  Math.min(MAX_INVOICE_DISCOUNT_PERCENT, Math.max(0, Number(value || 0)));

const getInvoiceItemTotal = (item) => {
  const discountPercent = normalizeInvoiceDiscountPercent(item.discount);
  const amount = Number(item.amount || 0);
  const unitPrice = Number(item.unitPrice || 0);

  return Math.max(0, amount * unitPrice * (1 - discountPercent / 100));
};

const getInvoiceStateRecord = (app, stateName) => {
  const safeName = String(stateName || DEFAULT_INVOICE_STATE)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  const records = app.findRecordsByFilter(
    "invoicestates",
    `name = "${safeName}"`,
    "",
    1,
    0
  );

  return records.length > 0 ? records[0] : null;
};

const validateInvoicePayload = (body) => {
  if (!body.client) return "CLIENT_REQUIRED";
  if (!body.date) return "DATE_REQUIRED";
  if (!Array.isArray(body.items) || body.items.length === 0) return "ITEMS_REQUIRED";

  for (const item of body.items) {
    if (!item.product) return "ITEM_PRODUCT_REQUIRED";
    if (Number(item.amount || 0) <= 0) return "ITEM_AMOUNT_INVALID";
    if (Number(item.unitPrice || 0) < 0) return "ITEM_PRICE_INVALID";
    const discount = Number(item.discount || 0);
    if (discount < 0 || discount > MAX_INVOICE_DISCOUNT_PERCENT) {
      return "ITEM_DISCOUNT_INVALID";
    }
  }

  return "";
};

const invoiceRecordToJson = (record) => {
  const raw = record.publicExport();
  return JSON.parse(JSON.stringify(raw));
};

const getInvoiceMovementTypeRecord = (app, typeName) => {
  const safeName = String(typeName || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  const records = app.findRecordsByFilter(
    "payment_account_movement_types",
    `name = "${safeName}"`,
    "",
    1,
    0
  );

  return records.length > 0 ? records[0] : null;
};

const setInvoiceClientUpdatedBy = (record, auth) => {
  if (!auth || auth.isSuperuser()) return;

  try {
    record.collection().fields.getByName("updated_by");
    record.set("updated_by", auth.id);
  } catch {
    // The field is optional across collections.
  }
};

const createInvoiceAccountMovementTx = (
  app,
  auth,
  client,
  typeName,
  amount,
  description
) => {
  const type = getInvoiceMovementTypeRecord(app, typeName);

  if (!type) {
    throw new Error("PAYMENT_TYPE_NOT_FOUND");
  }

  const movementCollection = app.findCollectionByNameOrId(
    "payment_account_movements"
  );
  const movement = new Record(movementCollection);
  const currentBalance = Number(client.get("balance") || 0);
  const nextBalance =
    typeName === INVOICE_PAYMENT_MOVEMENT_TYPE.payment
      ? currentBalance - Math.abs(amount)
      : currentBalance + Math.abs(amount);

  movement.set("client", client.id);
  movement.set("type", type.id);
  movement.set("amount", amount);
  movement.set("description", description);

  setInvoiceClientUpdatedBy(client, auth);
  client.set("balance", nextBalance);

  app.save(movement);
  app.save(client);

  return movement;
};

routerAdd(
  "POST",
  "/coki/invoices",
  (e) => {
    const body = e.requestInfo().body || {};
    const validationError = validateInvoicePayload(body);

    if (validationError) {
      return e.json(400, {
        message: "No se pudo crear la factura.",
        code: validationError,
      });
    }

    const invoiceStateName = String(body.state || DEFAULT_INVOICE_STATE);
    const shouldUpdateAccount = invoiceStateName === DEFAULT_INVOICE_STATE;
    const paidNow = Boolean(body.paidNow);
    const requestedPaidAmount = Number(body.paidAmount || 0);
    let result;

    try {
      $app.runInTransaction((txApp) => {
        const invoiceProductsData = body.items.map((item) => ({
          product: item.product,
          amount: Number(item.amount || 0),
          unitPrice: Number(item.unitPrice || 0),
          discount: normalizeInvoiceDiscountPercent(item.discount),
          total: getInvoiceItemTotal(item),
        }));
        const subtotal = invoiceProductsData.reduce(
          (acc, item) => acc + item.total,
          0
        );
        const invoiceDiscountPercent = normalizeInvoiceDiscountPercent(body.discount);
        const invoiceTotal = Math.max(
          0,
          subtotal * (1 - invoiceDiscountPercent / 100)
        );
        const invoiceState = getInvoiceStateRecord(txApp, invoiceStateName);

        if (!invoiceState) {
          throw new Error("STATE_NOT_FOUND");
        }

        const invoiceCollection = txApp.findCollectionByNameOrId("invoices");
        const invoice = new Record(invoiceCollection);

        invoice.set("client", body.client);
        invoice.set("date", body.date);
        invoice.set("discount", invoiceDiscountPercent);
        invoice.set("total", invoiceTotal);
        invoice.set("state", invoiceState.id);

        if (e.auth && !e.auth.isSuperuser()) {
          invoice.set("created_by", e.auth.id);
        }

        txApp.save(invoice);

        const invoiceProductsCollection =
          txApp.findCollectionByNameOrId("invoices_products");
        const invoiceProducts = [];

        for (const item of invoiceProductsData) {
          const invoiceProduct = new Record(invoiceProductsCollection);

          invoiceProduct.set("invoice", invoice.id);
          invoiceProduct.set("product", item.product);
          invoiceProduct.set("amount", item.amount);
          invoiceProduct.set("unit_price", item.unitPrice);
          invoiceProduct.set("discount", item.discount);
          invoiceProduct.set("total", item.total);

          if (e.auth && !e.auth.isSuperuser()) {
            invoiceProduct.set("created_by", e.auth.id);
          }

          txApp.save(invoiceProduct);
          invoiceProducts.push(invoiceProduct);
        }

        const paymentMovements = [];
        const paidAmount = paidNow
          ? invoiceTotal
          : Math.max(0, requestedPaidAmount);

        if (shouldUpdateAccount && invoiceTotal > 0) {
          const client = txApp.findRecordById("clients", body.client);
          const debtMovement = createInvoiceAccountMovementTx(
            txApp,
            e.auth,
            client,
            INVOICE_PAYMENT_MOVEMENT_TYPE.debt,
            invoiceTotal,
            `Factura ${invoice.id}`
          );
          paymentMovements.push(debtMovement);

          if (paidAmount > 0) {
            const paymentMovement = createInvoiceAccountMovementTx(
              txApp,
              e.auth,
              client,
              INVOICE_PAYMENT_MOVEMENT_TYPE.payment,
              paidAmount,
              `Pago factura ${invoice.id}`
            );
            paymentMovements.push(paymentMovement);
          }
        }

        result = { invoice, invoiceProducts, paymentMovements };
      });
    } catch (error) {
      return e.json(400, {
        message: "No se pudo crear la factura.",
        code: String(error && error.message ? error.message : "UNKNOWN"),
      });
    }

    return e.json(200, {
      invoice: invoiceRecordToJson(result.invoice),
      invoiceProducts: result.invoiceProducts.map((item) =>
        invoiceRecordToJson(item)
      ),
      paymentMovements: result.paymentMovements.map((item) =>
        invoiceRecordToJson(item)
      ),
    });
  },
  $apis.requireAuth()
);
