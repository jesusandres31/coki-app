/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    c.name AS client,\n    ct.id AS canteen,\n    ct.name AS canteenName,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ip.id,\n            'payment_method_id', ip.payment_method,\n            'payment_method_name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    canteens ct ON i.canteen = ct.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    ct.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // remove
  collection.schema.removeField("yv941rpo")

  // remove
  collection.schema.removeField("nilcttm7")

  // remove
  collection.schema.removeField("p8z57rie")

  // remove
  collection.schema.removeField("oalciyfn")

  // remove
  collection.schema.removeField("zykf9kn1")

  // remove
  collection.schema.removeField("n9m8wc8a")

  // remove
  collection.schema.removeField("pm9v2gbz")

  // remove
  collection.schema.removeField("k6xyfqe3")

  // remove
  collection.schema.removeField("cpv6txbc")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ij7wuinl",
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
    "id": "8jg6r5l6",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4qisbbfg",
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
    "id": "unedm7dc",
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
    "id": "c7ecdipe",
    "name": "canteen",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "istpwneq",
    "name": "canteenName",
    "type": "text",
    "required": false,
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
    "id": "gntwkddo",
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
    "id": "khbwrmad",
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
    "id": "wwz0wy6w",
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
    "id": "pw5mflil",
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
    "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    c.name AS client,\n    ct.name AS canteen,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ip.id,\n            'payment_method_id', ip.payment_method,\n            'payment_method_name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    canteens ct ON i.canteen = ct.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    ct.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yv941rpo",
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
    "id": "nilcttm7",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "p8z57rie",
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
    "id": "oalciyfn",
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
    "id": "zykf9kn1",
    "name": "canteen",
    "type": "text",
    "required": false,
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
    "id": "n9m8wc8a",
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
    "id": "pm9v2gbz",
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
    "id": "k6xyfqe3",
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
    "id": "cpv6txbc",
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
  collection.schema.removeField("ij7wuinl")

  // remove
  collection.schema.removeField("8jg6r5l6")

  // remove
  collection.schema.removeField("4qisbbfg")

  // remove
  collection.schema.removeField("unedm7dc")

  // remove
  collection.schema.removeField("c7ecdipe")

  // remove
  collection.schema.removeField("istpwneq")

  // remove
  collection.schema.removeField("gntwkddo")

  // remove
  collection.schema.removeField("khbwrmad")

  // remove
  collection.schema.removeField("wwz0wy6w")

  // remove
  collection.schema.removeField("pw5mflil")

  return dao.saveCollection(collection)
})
