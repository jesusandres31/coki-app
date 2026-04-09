/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "x93unrz0eq3eda1",
    "created": "2026-04-09 20:13:29.528Z",
    "updated": "2026-04-09 20:13:29.528Z",
    "name": "invoicestates",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "cjj7pxct",
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
  const collection = dao.findCollectionByNameOrId("x93unrz0eq3eda1");

  return dao.deleteCollection(collection);
})
