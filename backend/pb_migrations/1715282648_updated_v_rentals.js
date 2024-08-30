/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'rental', rp.rental,\n        'payment_method', rp.payment_method,\n        'total', rp.total\n      )\n    ) as rental_payments\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nLEFT JOIN \n    payment_methods pm ON rp.payment_method = pm.id\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // remove
  collection.schema.removeField("9mpwwu6m")

  // remove
  collection.schema.removeField("jn94jqe1")

  // remove
  collection.schema.removeField("icwbwquv")

  // remove
  collection.schema.removeField("gj6bbqa2")

  // remove
  collection.schema.removeField("vw00ctb8")

  // remove
  collection.schema.removeField("nsyg66zq")

  // remove
  collection.schema.removeField("umbcn8jz")

  // remove
  collection.schema.removeField("r5rw3ats")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zlkffz5k",
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
    "id": "fwhgqt9h",
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
    "id": "gdb97mkf",
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
    "id": "0saw3lpm",
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
    "id": "2mxezbcs",
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
    "id": "gyqt3tov",
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
    "id": "gqgxszjt",
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
    "id": "0vkwphar",
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
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid,\n    JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'rental', rp.rental,\n        'payment_method', rp.payment_method,\n        'total', rp.total\n      )\n    ) as rental_payments\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9mpwwu6m",
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
    "id": "jn94jqe1",
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
    "id": "icwbwquv",
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
    "id": "gj6bbqa2",
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
    "id": "vw00ctb8",
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
    "id": "nsyg66zq",
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
    "id": "umbcn8jz",
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
    "id": "r5rw3ats",
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
  collection.schema.removeField("zlkffz5k")

  // remove
  collection.schema.removeField("fwhgqt9h")

  // remove
  collection.schema.removeField("gdb97mkf")

  // remove
  collection.schema.removeField("0saw3lpm")

  // remove
  collection.schema.removeField("2mxezbcs")

  // remove
  collection.schema.removeField("gyqt3tov")

  // remove
  collection.schema.removeField("gqgxszjt")

  // remove
  collection.schema.removeField("0vkwphar")

  return dao.saveCollection(collection)
})
