/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN rp.rental IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', pm.name,\n            'total', rp.total\n          )\n      ELSE\n          NULL\n      END\n    ) as rental_payments\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nLEFT JOIN \n    payment_methods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // remove
  collection.schema.removeField("rral21mv")

  // remove
  collection.schema.removeField("rwzc48pq")

  // remove
  collection.schema.removeField("xlxg5yj4")

  // remove
  collection.schema.removeField("tkouce9l")

  // remove
  collection.schema.removeField("9wzdzijr")

  // remove
  collection.schema.removeField("zovtlqcl")

  // remove
  collection.schema.removeField("tyuivxj5")

  // remove
  collection.schema.removeField("cihqfsdo")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ssbza4mm",
    "name": "started_at",
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
    "id": "mhczqvkq",
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
    "id": "dx0iuhqg",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sqpnwbj7",
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
    "id": "tnbtbmfj",
    "name": "field",
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
    "id": "evihftyz",
    "name": "ball",
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
    "id": "bn30lusc",
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
    "id": "lomtdx2k",
    "name": "rental_payments",
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
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    COALESCE(\n      JSON_GROUP_ARRAY(\n        JSON_OBJECT(\n          'name', pm.name,\n          'total', rp.total\n        )\n      ), JSON('[]')\n    ) AS rental_payments\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nLEFT JOIN \n    payment_methods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rral21mv",
    "name": "started_at",
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
    "id": "rwzc48pq",
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
    "id": "xlxg5yj4",
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
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tkouce9l",
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
    "id": "9wzdzijr",
    "name": "field",
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
    "id": "zovtlqcl",
    "name": "ball",
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
    "id": "tyuivxj5",
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
    "id": "cihqfsdo",
    "name": "rental_payments",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // remove
  collection.schema.removeField("ssbza4mm")

  // remove
  collection.schema.removeField("mhczqvkq")

  // remove
  collection.schema.removeField("dx0iuhqg")

  // remove
  collection.schema.removeField("sqpnwbj7")

  // remove
  collection.schema.removeField("tnbtbmfj")

  // remove
  collection.schema.removeField("evihftyz")

  // remove
  collection.schema.removeField("bn30lusc")

  // remove
  collection.schema.removeField("lomtdx2k")

  return dao.saveCollection(collection)
})
