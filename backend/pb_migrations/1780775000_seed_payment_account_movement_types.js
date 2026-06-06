/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const typeCollection = app.findCollectionByNameOrId("payment_account_movement_types");
  const movementCollection = app.findCollectionByNameOrId("payment_account_movements");
  const typeNames = ["payment", "debt", "adjustment"];

  typeCollection.fields.getByName("name").required = true;
  movementCollection.fields.getByName("client").required = true;
  movementCollection.fields.getByName("type").required = true;
  movementCollection.fields.getByName("amount").required = true;

  app.save(typeCollection);
  app.save(movementCollection);

  for (const name of typeNames) {
    const existing = app.findRecordsByFilter(
      "payment_account_movement_types",
      `name = "${name}"`,
      "",
      1,
      0,
    );

    if (existing.length > 0) continue;

    const record = new Record(typeCollection);
    record.set("name", name);
    app.save(record);
  }
}, (app) => {
  const typeCollection = app.findCollectionByNameOrId("payment_account_movement_types");
  const movementCollection = app.findCollectionByNameOrId("payment_account_movements");
  const typeNames = ["payment", "debt", "adjustment"];

  for (const name of typeNames) {
    const records = app.findRecordsByFilter(
      "payment_account_movement_types",
      `name = "${name}"`,
      "",
      50,
      0,
    );

    for (const record of records) {
      app.delete(record);
    }
  }

  typeCollection.fields.getByName("name").required = false;
  movementCollection.fields.getByName("client").required = false;
  movementCollection.fields.getByName("type").required = false;
  movementCollection.fields.getByName("amount").required = false;

  app.save(typeCollection);
  app.save(movementCollection);
});
