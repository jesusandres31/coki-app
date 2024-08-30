/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ur14h8gcnpxdzyv",
    "created": "2024-04-12 19:51:59.944Z",
    "updated": "2024-04-12 19:51:59.944Z",
    "name": "invoice_view",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "atn38owq",
        "name": "date",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "ehlraks0",
        "name": "total",
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
        "id": "0tiuuewx",
        "name": "client",
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
        "id": "b0bzypqr",
        "name": "field",
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
        "id": "r7crl3xa",
        "name": "paid",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
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
      "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    f.name AS field,\n    COALESCE(SUM(ip.total), 0) AS paid\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    fields f ON i.field = f.id\nLEFT JOIN \n    invoice_payment ip ON i.id = ip.invoice\nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, f.name;"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv");

  return dao.deleteCollection(collection);
})
