/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca")

  collection.options = {
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // remove
  collection.schema.removeField("slq1ydoe")

  // remove
  collection.schema.removeField("bbnuxhac")

  // remove
  collection.schema.removeField("gnccs17d")

  // remove
  collection.schema.removeField("ijjfufda")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nayqod46",
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
    "id": "2f0uwyra",
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
    "id": "dfgiamqy",
    "name": "product_canteens",
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
    "id": "hhsuav71",
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
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id, p.created, p.updated, p.name, pc.stock, c.id, c.name;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "slq1ydoe",
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
    "id": "bbnuxhac",
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
    "id": "gnccs17d",
    "name": "product_canteens",
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
    "id": "ijjfufda",
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
  collection.schema.removeField("nayqod46")

  // remove
  collection.schema.removeField("2f0uwyra")

  // remove
  collection.schema.removeField("dfgiamqy")

  // remove
  collection.schema.removeField("hhsuav71")

  return dao.saveCollection(collection)
})
