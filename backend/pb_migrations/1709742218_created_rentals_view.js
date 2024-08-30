/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "loyyh45tjth6s0d",
    "created": "2024-03-06 16:23:38.537Z",
    "updated": "2024-03-06 16:23:38.537Z",
    "name": "rentals_view",
    "type": "view",
    "system": false,
    "schema": [],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "select id from rentals"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("loyyh45tjth6s0d");

  return dao.deleteCollection(collection);
})
