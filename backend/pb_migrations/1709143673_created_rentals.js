/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "okro6dwifudi6ee",
    "created": "2024-02-28 18:07:53.044Z",
    "updated": "2024-02-28 18:07:53.044Z",
    "name": "rentals",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "0bzbpzvj",
        "name": "client",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "3ghq3okw4e9u3h7",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "sjgphgmv",
        "name": "from",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "zojhevgp",
        "name": "to",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
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
  const collection = dao.findCollectionByNameOrId("okro6dwifudi6ee");

  return dao.deleteCollection(collection);
})
