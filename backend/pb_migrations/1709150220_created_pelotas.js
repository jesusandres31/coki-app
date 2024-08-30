/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "r6ik37a3gxmq3fh",
    "created": "2024-02-28 19:57:00.245Z",
    "updated": "2024-02-28 19:57:00.245Z",
    "name": "pelotas",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "0qb0fzzb",
        "name": "name",
        "type": "text",
        "required": true,
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
        "id": "8yu28a8z",
        "name": "detail",
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
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh");

  return dao.deleteCollection(collection);
})
