/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "kgipq57hx2r1m59",
    "created": "2024-05-01 18:30:42.094Z",
    "updated": "2024-05-01 18:30:42.094Z",
    "name": "deleted",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hyyhiwmv",
        "name": "collection",
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
        "id": "ewzmahdf",
        "name": "record",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
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
  const collection = dao.findCollectionByNameOrId("kgipq57hx2r1m59");

  return dao.deleteCollection(collection);
})
