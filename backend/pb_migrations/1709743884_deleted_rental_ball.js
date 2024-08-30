/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("f38r0n06h8kwjbj");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "f38r0n06h8kwjbj",
    "created": "2024-03-01 13:33:55.162Z",
    "updated": "2024-03-01 13:34:13.141Z",
    "name": "rental_ball",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "zlvjle4j",
        "name": "rental",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "okro6dwifudi6ee",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "0s4ts2vl",
        "name": "ball",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "r6ik37a3gxmq3fh",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "fbc96wqm",
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
})
