/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS rental_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // remove
  collection.schema.removeField("ggngopdt")

  // remove
  collection.schema.removeField("ewsidsxv")

  // remove
  collection.schema.removeField("kat7woo2")

  // remove
  collection.schema.removeField("sd4q4yox")

  // remove
  collection.schema.removeField("siofbwqu")

  // remove
  collection.schema.removeField("6pwbj2i4")

  // remove
  collection.schema.removeField("bkukd8vj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a5bpla5z",
    "name": "date",
    "type": "date",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "m2cgtgqm",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vnx7u0pu",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ibbg9drd",
    "name": "location",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jzknb9ss",
    "name": "paid",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ywubrf7w",
    "name": "rental_payments",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "eh9lknjr",
    "name": "invoice_items",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS rental_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoices_items\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ggngopdt",
    "name": "date",
    "type": "date",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ewsidsxv",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kat7woo2",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sd4q4yox",
    "name": "location",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "siofbwqu",
    "name": "paid",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "6pwbj2i4",
    "name": "rental_payments",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bkukd8vj",
    "name": "invoices_items",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // remove
  collection.schema.removeField("a5bpla5z")

  // remove
  collection.schema.removeField("m2cgtgqm")

  // remove
  collection.schema.removeField("vnx7u0pu")

  // remove
  collection.schema.removeField("ibbg9drd")

  // remove
  collection.schema.removeField("jzknb9ss")

  // remove
  collection.schema.removeField("ywubrf7w")

  // remove
  collection.schema.removeField("eh9lknjr")

  return dao.saveCollection(collection)
})
