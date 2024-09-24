/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "defnylqa6c3g49s",
    "created": "2024-09-11 20:00:53.496Z",
    "updated": "2024-09-11 20:00:53.496Z",
    "name": "unitsMeasurement",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "c8oobxst",
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
  const collection = dao.findCollectionByNameOrId("defnylqa6c3g49s");

  return dao.deleteCollection(collection);
})
