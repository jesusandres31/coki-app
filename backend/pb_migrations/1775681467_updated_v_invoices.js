/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE(\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', p.id,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    ) FILTER (WHERE ii.id IS NOT NULL),\n    JSON('[]')\n  ) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN clients c\n  ON c.id = i.client\n AND COALESCE(c.deleted, '') = ''\nLEFT JOIN invoices_products ii\n  ON ii.invoice = i.id\n AND COALESCE(ii.deleted, '') = ''\nLEFT JOIN products p\n  ON p.id = ii.product\n AND COALESCE(p.deleted, '') = ''\nWHERE COALESCE(i.deleted, '') = ''\nGROUP BY\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  c.id,\n  c.name,\n  i.created,\n  i.updated,\n  i.deleted;"
  }

  // remove
  collection.schema.removeField("qtmqcogg")

  // remove
  collection.schema.removeField("dbxzx1zs")

  // remove
  collection.schema.removeField("ywovzymq")

  // remove
  collection.schema.removeField("t26oarfk")

  // remove
  collection.schema.removeField("deecca93")

  // remove
  collection.schema.removeField("pvfj9yd8")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hklbgh8a",
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
    "id": "ytormkf2",
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
    "id": "hbfsr5np",
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
    "id": "afhdkpek",
    "name": "client",
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
    "id": "nntp6znn",
    "name": "invoice_products",
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
    "id": "ysp1ncit",
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
    "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    JSON_OBJECT(\n      'id', c.id,\n      'name', c.name\n    ) AS client,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_products,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    invoices_products ii ON i.id = ii.invoice  \nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qtmqcogg",
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
    "id": "dbxzx1zs",
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
    "id": "ywovzymq",
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
    "id": "t26oarfk",
    "name": "client",
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
    "id": "deecca93",
    "name": "invoice_products",
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
    "id": "pvfj9yd8",
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
  collection.schema.removeField("hklbgh8a")

  // remove
  collection.schema.removeField("ytormkf2")

  // remove
  collection.schema.removeField("hbfsr5np")

  // remove
  collection.schema.removeField("afhdkpek")

  // remove
  collection.schema.removeField("nntp6znn")

  // remove
  collection.schema.removeField("ysp1ncit")

  return dao.saveCollection(collection)
})
