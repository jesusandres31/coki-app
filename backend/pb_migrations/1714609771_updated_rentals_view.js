/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ncryvzbv8btvulj")

  collection.options = {
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours, r.total, f.name, b.name;"
  }

  // remove
  collection.schema.removeField("lxefb9uu")

  // remove
  collection.schema.removeField("gr15lsjx")

  // remove
  collection.schema.removeField("edhebnp9")

  // remove
  collection.schema.removeField("9ggu2s9x")

  // remove
  collection.schema.removeField("7eqqzdom")

  // remove
  collection.schema.removeField("vusgr8bg")

  // remove
  collection.schema.removeField("lkmk5ell")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tv948tgv",
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
    "id": "uviqq6tf",
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
    "id": "3pfrtuo8",
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
    "id": "k8b3a0ab",
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
    "id": "yt0cz6zd",
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
    "id": "9y94iyg8",
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
    "id": "bwjuhz2z",
    "name": "paid",
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
    "query": "SELECT \n    r.id,\n    r.created,\n    r.updated,\n    r.started_at,\n    r.total,\n    r.hours_amount, \n    c.name AS client,\n    f.name AS field,\n    b.name AS ball,\n    COALESCE(SUM(rp.total), 0) AS paid\nFROM \n    rentals r\nLEFT JOIN \n    balls b ON r.ball = b.id    \nLEFT JOIN \n    clients c ON r.client = c.id\nLEFT JOIN \n    fields f ON r.field = f.id\nLEFT JOIN \n    rental_payment rp ON r.id = rp.rental\nGROUP BY \n    r.id, r.created, r.updated, c.name, r.started_at, r.hours_amount, r.total, f.name, b.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lxefb9uu",
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
    "id": "gr15lsjx",
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
    "id": "edhebnp9",
    "name": "hours_amount",
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
    "id": "9ggu2s9x",
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
    "id": "7eqqzdom",
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
    "id": "vusgr8bg",
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
    "id": "lkmk5ell",
    "name": "paid",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 1
    }
  }))

  // remove
  collection.schema.removeField("tv948tgv")

  // remove
  collection.schema.removeField("uviqq6tf")

  // remove
  collection.schema.removeField("3pfrtuo8")

  // remove
  collection.schema.removeField("k8b3a0ab")

  // remove
  collection.schema.removeField("yt0cz6zd")

  // remove
  collection.schema.removeField("9y94iyg8")

  // remove
  collection.schema.removeField("bwjuhz2z")

  return dao.saveCollection(collection)
})
