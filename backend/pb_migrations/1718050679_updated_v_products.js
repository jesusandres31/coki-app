/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca")

  collection.options = {
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // remove
  collection.schema.removeField("hbxzfyul")

  // remove
  collection.schema.removeField("6jn1extx")

  // remove
  collection.schema.removeField("etdmx9n8")

  // remove
  collection.schema.removeField("foddq1hl")

  // remove
  collection.schema.removeField("adnx8por")

  // remove
  collection.schema.removeField("tp1cslhv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5v08k4xg",
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
    "id": "xzr2ex9d",
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
    "id": "djdkpl0j",
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
    "id": "saguoi4r",
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
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    pc.canteen as 'canteen_id',\n    c.name as 'canteen_name',\n    pc.stock,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nLEFT JOIN \n    products_canteens pc ON p.id = pc.product\nLEFT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hbxzfyul",
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
    "id": "6jn1extx",
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
    "id": "etdmx9n8",
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
    "id": "foddq1hl",
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
    "id": "adnx8por",
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
    "id": "tp1cslhv",
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
  collection.schema.removeField("5v08k4xg")

  // remove
  collection.schema.removeField("xzr2ex9d")

  // remove
  collection.schema.removeField("djdkpl0j")

  // remove
  collection.schema.removeField("saguoi4r")

  return dao.saveCollection(collection)
})
