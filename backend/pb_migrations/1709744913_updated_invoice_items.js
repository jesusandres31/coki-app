/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cbusqm5pbt7nh92")

  collection.name = "invoice_item"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cbusqm5pbt7nh92")

  collection.name = "invoice_items"

  return dao.saveCollection(collection)
})
