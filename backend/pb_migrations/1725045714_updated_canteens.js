/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l6ser6vmmuntz9a")

  collection.name = "stores"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l6ser6vmmuntz9a")

  collection.name = "canteens"

  return dao.saveCollection(collection)
})
