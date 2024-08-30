/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "e0yuy3qavvulbgv",
    "created": "2024-02-28 18:11:30.298Z",
    "updated": "2024-02-28 18:11:30.298Z",
    "name": "fields",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fhbobvkt",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "qv8hjuuo",
        "name": "price_per_hour",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv");

  return dao.deleteCollection(collection);
})
