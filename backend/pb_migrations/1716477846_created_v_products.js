/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ganm6vk9fd8geca",
    "created": "2024-05-23 15:24:06.718Z",
    "updated": "2024-05-23 15:24:06.718Z",
    "name": "v_products",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "n9i79al5",
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
        "id": "xaqwzeik",
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
        "id": "4jveguim",
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
        "id": "gfph9reo",
        "name": "canteen_id",
        "type": "relation",
        "required": false,
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
        "id": "tt81ouka",
        "name": "canteen_name",
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
        "id": "s54xfk9x",
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
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    pc.stock AS stock,\n    c.id AS canteen_id,\n    c.name AS canteen_name,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id, p.created, p.updated, p.name, pc.stock, c.id, c.name;"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca");

  return dao.deleteCollection(collection);
})
