/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("76tlljiwxdv7o4y")

  collection.name = "products_stores"
  collection.indexes = [
    "CREATE INDEX `idx_3mr6ExQ` ON `products_stores` (`product`)"
  ]

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0ozr2b58",
    "name": "store",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("76tlljiwxdv7o4y")

  collection.name = "products_canteens"
  collection.indexes = [
    "CREATE INDEX `idx_3mr6ExQ` ON `products_canteens` (`product`)"
  ]

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0ozr2b58",
    "name": "canteen",
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

  return dao.saveCollection(collection)
})
