/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  s.name AS state,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE(\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', ii.product,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    ) FILTER (WHERE ii.id IS NOT NULL),\n    JSON('[]')\n  ) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN invoicestates s\n  ON s.id = i.state\nLEFT JOIN clients c\n  ON c.id = i.client\nLEFT JOIN invoices_products ii\n  ON ii.invoice = i.id\nLEFT JOIN products p\n  ON p.id = ii.product\nWHERE COALESCE(i.deleted, '') = ''\nGROUP BY\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  s.name,\n  c.id,\n  c.name,\n  i.created,\n  i.updated,\n  i.deleted;\n"
  }

  // remove
  collection.schema.removeField("tkpz1sun")

  // remove
  collection.schema.removeField("63g0noth")

  // remove
  collection.schema.removeField("ueid4sef")

  // remove
  collection.schema.removeField("zqu1zzhh")

  // remove
  collection.schema.removeField("3aloew6y")

  // remove
  collection.schema.removeField("gj27cvym")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wwomlgpo",
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
    "id": "aliktzwd",
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
    "id": "51bcnf0h",
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
    "id": "behxuyao",
    "name": "state",
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
    "id": "kvwokm3r",
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
    "id": "gsknpnej",
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
    "id": "zvnmrxqe",
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
    "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE(\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', ii.product,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    ) FILTER (WHERE ii.id IS NOT NULL),\n    JSON('[]')\n  ) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN clients c\n  ON c.id = i.client\nLEFT JOIN invoices_products ii\n  ON ii.invoice = i.id\nLEFT JOIN products p\n  ON p.id = ii.product\nWHERE COALESCE(i.deleted, '') = ''\nGROUP BY\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  c.id,\n  c.name,\n  i.created,\n  i.updated,\n  i.deleted;\n"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tkpz1sun",
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
    "id": "63g0noth",
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
    "id": "ueid4sef",
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
    "id": "zqu1zzhh",
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
    "id": "3aloew6y",
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
    "id": "gj27cvym",
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
  collection.schema.removeField("wwomlgpo")

  // remove
  collection.schema.removeField("aliktzwd")

  // remove
  collection.schema.removeField("51bcnf0h")

  // remove
  collection.schema.removeField("behxuyao")

  // remove
  collection.schema.removeField("kvwokm3r")

  // remove
  collection.schema.removeField("gsknpnej")

  // remove
  collection.schema.removeField("zvnmrxqe")

  return dao.saveCollection(collection)
})
