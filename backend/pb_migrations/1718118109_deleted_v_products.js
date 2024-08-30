/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ganm6vk9fd8geca",
    "created": "2024-05-23 15:24:06.718Z",
    "updated": "2024-06-11 13:46:58.580Z",
    "name": "v_products",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8fkfmcim",
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
        "id": "koneacnu",
        "name": "unit_price",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "3nl1yqzo",
        "name": "canteen_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "l6ser6vmmuntz9a",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "5xaosdb6",
        "name": "stock",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "bhnfifeb",
        "name": "deleted",
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
    "listRule": "",
    "viewRule": "",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    pc.canteen as canteen_id, \n    pc.stock as stock,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products_canteens pc\nLEFT JOIN \n    products p ON pc.product = p.id\nLEFT JOIN \n    canteens c ON pc.canteen = c.id;\n"
    }
  });

  return Dao(db).saveCollection(collection);
})
