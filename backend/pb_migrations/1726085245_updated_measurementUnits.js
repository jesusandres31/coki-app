/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("defnylqa6c3g49s")

  collection.name = "measureUnits"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("defnylqa6c3g49s")

  collection.name = "measurementUnits"

  return dao.saveCollection(collection)
})
