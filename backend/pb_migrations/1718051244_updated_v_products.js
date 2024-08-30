/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca")

  collection.options = {
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    pc.canteen as canteen_id, \n    c.name as canteen_name,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nINNER JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // remove
  collection.schema.removeField("7j3dojdd")

  // remove
  collection.schema.removeField("712ds6cm")

  // remove
  collection.schema.removeField("ghuwhf8w")

  // remove
  collection.schema.removeField("ac8sx0iq")

  // remove
  collection.schema.removeField("oc3ahokr")

  // remove
  collection.schema.removeField("xoln494w")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cra4pb36",
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
    "id": "nmbev9hc",
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
    "id": "iyfuxouu",
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
    "id": "tt863aej",
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
    "id": "8kyzg8kg",
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
    "id": "mj9f6a8c",
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
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    pc.canteen as canteen_id, \n    c.name as canteen_name,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7j3dojdd",
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
    "id": "712ds6cm",
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
    "id": "ghuwhf8w",
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
    "id": "ac8sx0iq",
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
    "id": "oc3ahokr",
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
    "id": "xoln494w",
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
  collection.schema.removeField("cra4pb36")

  // remove
  collection.schema.removeField("nmbev9hc")

  // remove
  collection.schema.removeField("iyfuxouu")

  // remove
  collection.schema.removeField("tt863aej")

  // remove
  collection.schema.removeField("8kyzg8kg")

  // remove
  collection.schema.removeField("mj9f6a8c")

  return dao.saveCollection(collection)
})
