/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN rp.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', pm.name,\n            'total', rp.total\n          )\n      ELSE\n          NULL\n      END\n    ) as rental_payments\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rentals_payments rp ON r.id = rp.rental\nLEFT JOIN \n    payment_methods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // remove
  collection.schema.removeField("87lrnow3")

  // remove
  collection.schema.removeField("flh2ohta")

  // remove
  collection.schema.removeField("tjb52a32")

  // remove
  collection.schema.removeField("yurlgriw")

  // remove
  collection.schema.removeField("adsd1ail")

  // remove
  collection.schema.removeField("znb4psv1")

  // remove
  collection.schema.removeField("onyobcj2")

  // remove
  collection.schema.removeField("pqugp76k")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rjbgc8zg",
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
    "id": "piinjtpe",
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
    "id": "umakyus0",
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
    "id": "uz9bqm7r",
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
    "id": "dpdirdig",
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
    "id": "ekfybsqd",
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
    "id": "trxlhly9",
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
    "id": "ek2fjk9m",
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
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN rp.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'name', pm.name,\n            'total', rp.total\n          )\n      ELSE\n          NULL\n      END\n    ) as rental_payments\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nLEFT JOIN \n    payment_methods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "87lrnow3",
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
    "id": "flh2ohta",
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
    "id": "tjb52a32",
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
    "id": "yurlgriw",
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
    "id": "adsd1ail",
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
    "id": "znb4psv1",
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
    "id": "onyobcj2",
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
    "id": "pqugp76k",
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
  collection.schema.removeField("rjbgc8zg")

  // remove
  collection.schema.removeField("piinjtpe")

  // remove
  collection.schema.removeField("umakyus0")

  // remove
  collection.schema.removeField("uz9bqm7r")

  // remove
  collection.schema.removeField("dpdirdig")

  // remove
  collection.schema.removeField("ekfybsqd")

  // remove
  collection.schema.removeField("trxlhly9")

  // remove
  collection.schema.removeField("ek2fjk9m")

  return dao.saveCollection(collection)
})
