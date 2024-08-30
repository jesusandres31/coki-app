/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("56z03agvzy6zfgy")

  collection.indexes = [
    "CREATE INDEX `idx_u1UO7L3` ON `invoice_payment` (`invoice`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("56z03agvzy6zfgy")

  collection.indexes = []

  return dao.saveCollection(collection)
})
