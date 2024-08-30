/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ganm6vk9fd8geca")

  collection.options = {
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    pc.canteen as canteen_id, \n    c.name as canteen_name,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nRIGHT JOIN \n    products_canteens pc ON p.id = pc.product\nRIGHT JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // remove
  collection.schema.removeField("pbgry4vs")

  // remove
  collection.schema.removeField("jhm8yg62")

  // remove
  collection.schema.removeField("omiigbfe")

  // remove
  collection.schema.removeField("icazmtq6")

  // remove
  collection.schema.removeField("pfvq8wry")

  // remove
  collection.schema.removeField("u2zhockl")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "2ljonhvj",
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
    "id": "qicdvyuu",
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
    "id": "tvwkkoqn",
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
    "id": "3briawpg",
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
    "id": "mvg43ngy",
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
    "id": "0jm5b1w8",
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
    "query": "SELECT \n    p.id,\n    p.name,\n    p.unit_price,\n    JSON_GROUP_ARRAY(\n      CASE WHEN pc.id IS NOT NULL THEN\n          JSON_OBJECT(\n            'id', pc.id,\n            'canteen_id', pc.canteen,\n            'canteen_name', c.name,\n            'stock', pc.stock\n          )\n      ELSE\n          NULL\n      END\n    ) AS product_canteens,\n    pc.canteen as canteen_id, \n    c.name as canteen_name,\n    p.created,\n    p.updated,\n    p.deleted\nFROM \n    products p\nINNER JOIN \n    products_canteens pc ON p.id = pc.product\nINNER JOIN \n    canteens c ON pc.canteen = c.id  \nGROUP BY \n    p.id,\n    p.name,\n    p.unit_price,\n    p.created,\n    p.updated,\n    p.deleted;"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pbgry4vs",
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
    "id": "jhm8yg62",
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
    "id": "omiigbfe",
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
    "id": "icazmtq6",
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
    "id": "pfvq8wry",
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
    "id": "u2zhockl",
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
  collection.schema.removeField("2ljonhvj")

  // remove
  collection.schema.removeField("qicdvyuu")

  // remove
  collection.schema.removeField("tvwkkoqn")

  // remove
  collection.schema.removeField("3briawpg")

  // remove
  collection.schema.removeField("mvg43ngy")

  // remove
  collection.schema.removeField("0jm5b1w8")

  return dao.saveCollection(collection)
})
