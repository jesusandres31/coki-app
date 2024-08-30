/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3ghq3okw4e9u3h7")

  collection.name = "clients"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3ghq3okw4e9u3h7")

  collection.name = "products"

  return dao.saveCollection(collection)
})
