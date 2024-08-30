/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("loyyh45tjth6s0d")

  collection.name = "view_rentals"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("loyyh45tjth6s0d")

  collection.name = "rentals_view"

  return dao.saveCollection(collection)
})
