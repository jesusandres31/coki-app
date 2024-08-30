/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ncryvzbv8btvulj",
    "created": "2024-04-12 20:09:00.194Z",
    "updated": "2024-06-13 19:31:25.733Z",
    "name": "v_rentals",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "epeuvkjr",
        "name": "started_at",
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
        "id": "la1bzgcz",
        "name": "discount",
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
        "id": "tjdksdaq",
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
        "id": "ynhtx03n",
        "name": "hours",
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
        "id": "cixbxoxb",
        "name": "client",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "ozhucvou",
        "name": "field",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "nrqfsute",
        "name": "ball",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "mbfjocef",
        "name": "location",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "zb02tu64wtql7y7",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "zn9woebt",
        "name": "paid",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "0gf8blxb",
        "name": "rental_payments",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1
        }
      },
      {
        "system": false,
        "id": "yrc4s322",
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
      "query": "SELECT \n    r.id,\n    r.started_at,\n    r.discount,\n    r.total,\n    r.hours,\n    JSON_OBJECT(\n      'id', c.id,\n      'name', c.name\n    ) AS client,\n    JSON_OBJECT(\n      'id', f.id,\n      'name', f.name\n    ) AS field,\n    JSON_OBJECT(\n      'id', b.id,\n      'name', b.name\n    ) AS ball,\n    f.location AS location,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN rp.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', rp.id,\n            'payment_method_id', rp.payment_method,\n            'payment_method_name', pm.name,\n            'total', rp.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS rental_payments,\n    r.created,\n    r.updated,\n    r.deleted\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rentals_payments rp ON r.id = rp.rental\nLEFT JOIN \n    paymentMethods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name,\n    f.name,\n    b.name,\n    r.created,\n    r.updated,\n    r.deleted;"
    }
  });

  return Dao(db).saveCollection(collection);
})
