/// <reference path="../pb_data/types.d.ts" />

const PAYMENT_MOVEMENT_TYPE = {
  payment: "payment",
  debt: "debt",
  adjustment: "adjustment",
};

const paymentMovementTypeNames = [
  PAYMENT_MOVEMENT_TYPE.payment,
  PAYMENT_MOVEMENT_TYPE.debt,
  PAYMENT_MOVEMENT_TYPE.adjustment,
];

const normalizeAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
};

const getTypeRecord = (app, typeName) => {
  const safeName = String(typeName || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const records = app.findRecordsByFilter(
    "payment_account_movement_types",
    `name = "${safeName}"`,
    "",
    1,
    0
  );

  return records.length > 0 ? records[0] : null;
};

const getNextBalance = (typeName, currentBalance, amount) => {
  if (typeName === PAYMENT_MOVEMENT_TYPE.payment) return currentBalance - Math.abs(amount);
  if (typeName === PAYMENT_MOVEMENT_TYPE.debt) return currentBalance + Math.abs(amount);
  return amount;
};

const recordToJson = (record) => {
  const raw = record.publicExport();
  return JSON.parse(JSON.stringify(raw));
};

const setUpdatedBy = (record, auth) => {
  if (!auth || auth.isSuperuser()) return;

  try {
    record.collection().fields.getByName("updated_by");
    record.set("updated_by", auth.id);
  } catch {
    // The field is optional across collections.
  }
};

const createPaymentAccountMovementTx = (
  app,
  auth,
  clientId,
  typeName,
  amount,
  description
) => {
  if (!clientId) {
    throw new Error("CLIENT_REQUIRED");
  }

  if (!paymentMovementTypeNames.includes(typeName)) {
    throw new Error("TYPE_INVALID");
  }

  const normalizedAmount = normalizeAmount(amount);
  if (!Number.isFinite(normalizedAmount)) {
    throw new Error("AMOUNT_INVALID");
  }

  if (typeName !== PAYMENT_MOVEMENT_TYPE.adjustment && normalizedAmount <= 0) {
    throw new Error("AMOUNT_POSITIVE_REQUIRED");
  }

  const client = app.findRecordById("clients", clientId);
  const type = getTypeRecord(app, typeName);

  if (!type) {
    throw new Error("TYPE_NOT_FOUND");
  }

  const currentBalance = Number(client.get("balance") || 0);
  const nextBalance = getNextBalance(typeName, currentBalance, normalizedAmount);
  const movementCollection = app.findCollectionByNameOrId("payment_account_movements");
  const movement = new Record(movementCollection);

  movement.set("client", clientId);
  movement.set("type", type.id);
  movement.set("amount", normalizedAmount);
  movement.set("description", String(description || "").trim());

  setUpdatedBy(client, auth);
  client.set("balance", nextBalance);

  app.save(movement);
  app.save(client);

  return { movement, client };
};

routerAdd(
  "POST",
  "/coki/payment-account-movements",
  (e) => {
    const body = e.requestInfo().body || {};
    let result;

    try {
      $app.runInTransaction((txApp) => {
        result = createPaymentAccountMovementTx(
          txApp,
          e.auth,
          body.clientId,
          body.typeName,
          body.amount,
          body.description
        );
      });
    } catch (error) {
      return e.json(400, {
        message: "No se pudo registrar el movimiento.",
        code: String(error && error.message ? error.message : "UNKNOWN"),
      });
    }

    return e.json(200, {
      movement: recordToJson(result.movement),
      client: recordToJson(result.client),
    });
  },
  $apis.requireAuth()
);
