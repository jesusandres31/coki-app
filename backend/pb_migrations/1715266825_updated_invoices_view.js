/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoice_payment ip ON i.id = ip.invoice\nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // remove
  collection.schema.removeField("j4rd7us2")

  // remove
  collection.schema.removeField("4t1lqntt")

  // remove
  collection.schema.removeField("t7ri4pi1")

  // remove
  collection.schema.removeField("sitv0tyv")

  // remove
  collection.schema.removeField("7iypzhuo")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "osmgykh6",
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
    "id": "8xkfnm5m",
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
    "id": "n3ogdnwl",
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
    "id": "iyhram3c",
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
    "id": "bhncj6q0",
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
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    f.name AS field,\n    COALESCE(SUM(ip.total), 0) AS paid\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    fields f ON i.field = f.id\nLEFT JOIN \n    invoice_payment ip ON i.id = ip.invoice\nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, f.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "j4rd7us2",
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
    "id": "4t1lqntt",
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
    "id": "t7ri4pi1",
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
    "id": "sitv0tyv",
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
    "id": "7iypzhuo",
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
  collection.schema.removeField("osmgykh6")

  // remove
  collection.schema.removeField("8xkfnm5m")

  // remove
  collection.schema.removeField("n3ogdnwl")

  // remove
  collection.schema.removeField("iyhram3c")

  // remove
  collection.schema.removeField("bhncj6q0")

  return dao.saveCollection(collection)
})
