/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ur14h8gcnpxdzyv")

  collection.options = {
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoices_payments ip ON i.id = ip.invoice\nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // remove
  collection.schema.removeField("vdc5wuaf")

  // remove
  collection.schema.removeField("tiknbizt")

  // remove
  collection.schema.removeField("fkz1rzsx")

  // remove
  collection.schema.removeField("0wjpg6gi")

  // remove
  collection.schema.removeField("dshenoce")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "na1hvzpg",
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
    "id": "ehx3sktv",
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
    "id": "co9e1zwk",
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
    "id": "c9oemlcp",
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
    "id": "7eojvkhe",
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
    "query": "SELECT \n    i.id,\n    i.created,\n    i.updated,\n    i.date,\n    i.total,\n    c.name AS client,\n    l.name AS location,\n    COALESCE(SUM(ip.total), 0) AS paid\nFROM \n    invoices i\nLEFT JOIN \n    clients c ON i.client = c.id\nLEFT JOIN \n    locations l ON i.location = l.id\nLEFT JOIN \n    invoice_payment ip ON i.id = ip.invoice\nGROUP BY \n    i.id, i.created, i.updated, c.name, i.date, i.total, l.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "vdc5wuaf",
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
    "id": "tiknbizt",
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
    "id": "fkz1rzsx",
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
    "id": "0wjpg6gi",
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
    "id": "dshenoce",
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
  collection.schema.removeField("na1hvzpg")

  // remove
  collection.schema.removeField("ehx3sktv")

  // remove
  collection.schema.removeField("co9e1zwk")

  // remove
  collection.schema.removeField("c9oemlcp")

  // remove
  collection.schema.removeField("7eojvkhe")

  return dao.saveCollection(collection)
})
