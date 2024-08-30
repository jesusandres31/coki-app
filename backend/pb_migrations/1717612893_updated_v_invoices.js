/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ip.id,\n            'payment_method_id', ip.payment_method,\n            'payment_method_name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    l.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // remove
  collection.schema.removeField("nbnkyebd")

  // remove
  collection.schema.removeField("2civysaw")

  // remove
  collection.schema.removeField("34qvo1iy")

  // remove
  collection.schema.removeField("4b8zqiil")

  // remove
  collection.schema.removeField("y0e5vev1")

  // remove
  collection.schema.removeField("sritavbh")

  // remove
  collection.schema.removeField("xcsocxwx")

  // remove
  collection.schema.removeField("oiwnrlum")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rcrhx5ob",
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
    "id": "jf7m6dne",
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
    "id": "qxdviref",
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
    "id": "hjlhg7mw",
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
    "id": "ike32sdg",
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
    "id": "jyqyakeb",
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
    "id": "xa7fdfyr",
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
    "id": "9yih5vgt",
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
    "id": "5ho9mkww",
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
    "query": "SELECT \n    i.id,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ip.id,\n            'payment_method_id', ip.payment_method,\n            'payment_method_name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    l.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nbnkyebd",
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
    "id": "2civysaw",
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
    "id": "34qvo1iy",
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
    "id": "4b8zqiil",
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
    "id": "y0e5vev1",
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
    "id": "sritavbh",
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
    "id": "xcsocxwx",
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
    "id": "oiwnrlum",
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
  collection.schema.removeField("rcrhx5ob")

  // remove
  collection.schema.removeField("jf7m6dne")

  // remove
  collection.schema.removeField("qxdviref")

  // remove
  collection.schema.removeField("hjlhg7mw")

  // remove
  collection.schema.removeField("ike32sdg")

  // remove
  collection.schema.removeField("jyqyakeb")

  // remove
  collection.schema.removeField("xa7fdfyr")

  // remove
  collection.schema.removeField("9yih5vgt")

  // remove
  collection.schema.removeField("5ho9mkww")

  return dao.saveCollection(collection)
})
