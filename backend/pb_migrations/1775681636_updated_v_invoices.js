/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE(\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', ii.product,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    ) FILTER (WHERE ii.id IS NOT NULL),\n    JSON('[]')\n  ) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN clients c\n  ON c.id = i.client\nLEFT JOIN invoices_products ii\n  ON ii.invoice = i.id\nLEFT JOIN products p\n  ON p.id = ii.product\nWHERE COALESCE(i.deleted, '') = ''\nGROUP BY\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  c.id,\n  c.name,\n  i.created,\n  i.updated,\n  i.deleted;\n"
  }

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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jmula1q0",
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
    "id": "akihkqdn",
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
    "id": "afw9ynrz",
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
    "id": "0ydzvkb4",
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
    "id": "ed18iaac",
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
    "id": "nx9okx49",
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
    "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE(\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', p.id,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    ) FILTER (WHERE ii.id IS NOT NULL),\n    JSON('[]')\n  ) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN clients c\n  ON c.id = i.client\n AND COALESCE(c.deleted, '') = ''\nLEFT JOIN invoices_products ii\n  ON ii.invoice = i.id\n AND COALESCE(ii.deleted, '') = ''\nLEFT JOIN products p\n  ON p.id = ii.product\n AND COALESCE(p.deleted, '') = ''\nWHERE COALESCE(i.deleted, '') = ''\nGROUP BY\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  c.id,\n  c.name,\n  i.created,\n  i.updated,\n  i.deleted;"
  }

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

  // remove
  collection.schema.removeField("jmula1q0")

  // remove
  collection.schema.removeField("akihkqdn")

  // remove
  collection.schema.removeField("afw9ynrz")

  // remove
  collection.schema.removeField("0ydzvkb4")

  // remove
  collection.schema.removeField("ed18iaac")

  // remove
  collection.schema.removeField("nx9okx49")

  return dao.saveCollection(collection)
})
