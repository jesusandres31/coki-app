/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cbusqm5pbt7nh92")

  collection.indexes = [
    "CREATE INDEX `idx_4EAoOA0` ON `invoice_item` (`invoice`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cbusqm5pbt7nh92")

  collection.indexes = []

  return dao.saveCollection(collection)
})
