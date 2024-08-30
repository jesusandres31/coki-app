/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    JSON_OBJECT(\n      'id', c.id,\n      'name', c.name\n    ) AS client,\n    JSON_OBJECT(\n      'id', s.id,\n      'name', s.name\n    ) AS store,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ip.id,\n            'payment_method_id', ip.payment_method,\n            'payment_method_name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    stores s ON i.store = s.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    s.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // remove
  collection.schema.removeField("fwwdcmhk")

  // remove
  collection.schema.removeField("fzqkcyrx")

  // remove
  collection.schema.removeField("r9rbk8jt")

  // remove
  collection.schema.removeField("ntqplqjb")

  // remove
  collection.schema.removeField("upujxp2q")

  // remove
  collection.schema.removeField("emue3zid")

  // remove
  collection.schema.removeField("mhlnabyc")

  // remove
  collection.schema.removeField("8pvhlaam")

  // remove
  collection.schema.removeField("zqrwm5vg")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v1a5cdkg",
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
    "id": "hpiud98t",
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
    "id": "lf47s1th",
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
    "id": "f3xvkttt",
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
    "id": "rezixczq",
    "name": "store",
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
    "id": "bxo14a0l",
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
    "id": "8opcnrwh",
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
    "id": "c5jht7up",
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
    "id": "x6ya9vrw",
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
    "query": "SELECT \n    i.id,\n    i.date,\n    i.discount,\n    i.total,\n    JSON_OBJECT(\n      'id', c.id,\n      'name', c.name\n    ) AS client,\n    JSON_OBJECT(\n      'id', ct.id,\n      'name', ct.name\n    ) AS canteen,\n    COALESCE(SUM(ip.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ip.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ip.id,\n            'payment_method_id', ip.payment_method,\n            'payment_method_name', pm.name,\n            'total', ip.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_payments,\n    JSON_GROUP_ARRAY(\n      CASE WHEN ii.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', ii.id,\n            'product_id', ii.product,\n            'product_name', p.name,\n            'unit_price', ii.unit_price,\n            'amount', ii.amount,\n            'discount', ii.discount,\n            'total', ii.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS invoice_items,\n    i.created,\n    i.updated,\n    i.deleted\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    canteens ct ON i.canteen = ct.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nLEFT JOIN \n    invoices_items ii ON i.id = ii.invoice  \nLEFT JOIN \n    paymentMethods pm ON ip.payment_method = pm.id\nLEFT JOIN \n    products p ON ii.product = p.id  \nGROUP BY \n    i.id,\n    i.date,\n    i.total,\n    c.name,\n    ct.name,\n    i.created,\n    i.updated,\n    i.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fwwdcmhk",
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
    "id": "fzqkcyrx",
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
    "id": "r9rbk8jt",
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
    "id": "ntqplqjb",
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
    "id": "upujxp2q",
    "name": "canteen",
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
    "id": "emue3zid",
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
    "id": "mhlnabyc",
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
    "id": "8pvhlaam",
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
    "id": "zqrwm5vg",
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
  collection.schema.removeField("v1a5cdkg")

  // remove
  collection.schema.removeField("hpiud98t")

  // remove
  collection.schema.removeField("lf47s1th")

  // remove
  collection.schema.removeField("f3xvkttt")

  // remove
  collection.schema.removeField("rezixczq")

  // remove
  collection.schema.removeField("bxo14a0l")

  // remove
  collection.schema.removeField("8opcnrwh")

  // remove
  collection.schema.removeField("c5jht7up")

  // remove
  collection.schema.removeField("x6ya9vrw")

  return dao.saveCollection(collection)
})
