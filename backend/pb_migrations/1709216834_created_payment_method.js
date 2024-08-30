/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "hrt7u01irqlx0n8",
    "created": "2024-02-29 14:27:14.552Z",
    "updated": "2024-02-29 14:27:14.552Z",
    "name": "payment_method",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "lde9tnpb",
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
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8");

  return dao.deleteCollection(collection);
})
