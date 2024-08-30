/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.started_at,\n    r.discount,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN rp.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', rp.id,\n            'payment_method_id', rp.payment_method,\n            'payment_method_name', pm.name,\n            'total', rp.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS rental_payments,\n    r.created,\n    r.updated,\n    r.deleted\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rentals_payments rp ON r.id = rp.rental\nLEFT JOIN \n    paymentMethods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name,\n    f.name,\n    b.name,\n    r.created,\n    r.updated,\n    r.deleted;"
  }

  // remove
  collection.schema.removeField("sronnaax")

  // remove
  collection.schema.removeField("ifbvjj6z")

  // remove
  collection.schema.removeField("adwygs01")

  // remove
  collection.schema.removeField("exze5wta")

  // remove
  collection.schema.removeField("negb9j5a")

  // remove
  collection.schema.removeField("x3po1wt4")

  // remove
  collection.schema.removeField("ottjtkva")

  // remove
  collection.schema.removeField("noctho9a")

  // remove
  collection.schema.removeField("jjstq0j1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mgm6vo1u",
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
    "id": "nuctra8l",
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
    "id": "hllafqgu",
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
    "id": "ycuppxpw",
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
    "id": "pjbidu3z",
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
    "id": "yv7and0d",
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
    "id": "mpktx8fi",
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
    "id": "btkt4vld",
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
    "id": "wzcy7aix",
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
    "id": "7sf38a0g",
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
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      CASE WHEN rp.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', rp.id,\n            'payment_method_id', rp.payment_method,\n            'payment_method_name', pm.name,\n            'total', rp.total\n          )\n      ELSE\n          NULL\n      END\n    ) AS rental_payments,\n    r.created,\n    r.updated,\n    r.deleted\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rentals_payments rp ON r.id = rp.rental\nLEFT JOIN \n    paymentMethods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name,\n    f.name,\n    b.name,\n    r.created,\n    r.updated,\n    r.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sronnaax",
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
    "id": "ifbvjj6z",
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
    "id": "adwygs01",
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
    "id": "exze5wta",
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
    "id": "negb9j5a",
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
    "id": "x3po1wt4",
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
    "id": "ottjtkva",
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
    "id": "noctho9a",
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
    "id": "jjstq0j1",
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
  collection.schema.removeField("mgm6vo1u")

  // remove
  collection.schema.removeField("nuctra8l")

  // remove
  collection.schema.removeField("hllafqgu")

  // remove
  collection.schema.removeField("ycuppxpw")

  // remove
  collection.schema.removeField("pjbidu3z")

  // remove
  collection.schema.removeField("yv7and0d")

  // remove
  collection.schema.removeField("mpktx8fi")

  // remove
  collection.schema.removeField("btkt4vld")

  // remove
  collection.schema.removeField("wzcy7aix")

  // remove
  collection.schema.removeField("7sf38a0g")

  return dao.saveCollection(collection)
})
