/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', ip.id,\n            'name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // remove
  collection.schema.removeField("ovzgkvn1")

  // remove
  collection.schema.removeField("9jef8drr")

  // remove
  collection.schema.removeField("4zfs1osa")

  // remove
  collection.schema.removeField("oci5qngi")

  // remove
  collection.schema.removeField("oka1ley8")

  // remove
  collection.schema.removeField("ewrpl7xz")

  // remove
  collection.schema.removeField("3lsfo2zs")

  // remove
  collection.schema.removeField("mct6u9bx")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "r3pg3e29",
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
    "id": "usolm35y",
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
    "id": "lj7ttsfm",
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
    "id": "axkljtg0",
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
    "id": "nfrltm24",
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
    "id": "mdpfddcy",
    "name": "invoice_payments",
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
    "id": "2fiojuey",
    "name": "invoice_items",
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
    "id": "ivjeakls",
    "name": "deleted",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ovzgkvn1",
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
    "id": "9jef8drr",
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
    "id": "4zfs1osa",
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
    "id": "oci5qngi",
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
    "id": "oka1ley8",
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
    "id": "ewrpl7xz",
    "name": "invoice_payments",
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
    "id": "3lsfo2zs",
    "name": "invoice_items",
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
    "id": "mct6u9bx",
    "name": "deleted",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // remove
  collection.schema.removeField("r3pg3e29")

  // remove
  collection.schema.removeField("usolm35y")

  // remove
  collection.schema.removeField("lj7ttsfm")

  // remove
  collection.schema.removeField("axkljtg0")

  // remove
  collection.schema.removeField("nfrltm24")

  // remove
  collection.schema.removeField("mdpfddcy")

  // remove
  collection.schema.removeField("2fiojuey")

  // remove
  collection.schema.removeField("ivjeakls")

  return dao.saveCollection(collection)
})
