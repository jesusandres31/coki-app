/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca")

  collection.options = {
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    pc.canteen as canteen_id, \n    c.name as canteen_name,\n    pc.stock as stock,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nJOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // remove
  collection.schema.removeField("omsz3p1l")

  // remove
  collection.schema.removeField("zi8fzmcr")

  // remove
  collection.schema.removeField("wwzj2kpq")

  // remove
  collection.schema.removeField("6tlbw2sb")

  // remove
  collection.schema.removeField("o3greh9g")

  // remove
  collection.schema.removeField("ruhdqjfy")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wdvgbstc",
    "name": "name",
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
    "id": "ol6nzrgb",
    "name": "unit_price",
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
    "id": "ndirarwt",
    "name": "canteen_id",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "l6ser6vmmuntz9a",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bv1co6ei",
    "name": "canteen_name",
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
    "id": "waqm0nlu",
    "name": "stock",
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
    "id": "fnqwf9xr",
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
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca")

  collection.options = {
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    pc.canteen as canteen_id, \n    c.name as canteen_name,\n    pc.stock as stock,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "omsz3p1l",
    "name": "name",
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
    "id": "zi8fzmcr",
    "name": "unit_price",
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
    "id": "wwzj2kpq",
    "name": "canteen_id",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "l6ser6vmmuntz9a",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "6tlbw2sb",
    "name": "canteen_name",
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
    "id": "o3greh9g",
    "name": "stock",
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
    "id": "ruhdqjfy",
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
  collection.schema.removeField("wdvgbstc")

  // remove
  collection.schema.removeField("ol6nzrgb")

  // remove
  collection.schema.removeField("ndirarwt")

  // remove
  collection.schema.removeField("bv1co6ei")

  // remove
  collection.schema.removeField("waqm0nlu")

  // remove
  collection.schema.removeField("fnqwf9xr")

  return dao.saveCollection(collection)
})
