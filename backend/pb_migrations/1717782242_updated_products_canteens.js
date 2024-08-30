/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("76tlljiwxdv7o4y")

  collection.indexes = [
    "CREATE INDEX `idx_3mr6ExQ` ON `products_canteens` (`product`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("76tlljiwxdv7o4y")

  collection.indexes = []

  return dao.saveCollection(collection)
})
