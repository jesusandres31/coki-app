/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  collection.name = "balls"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  collection.name = "pelotas"

  return dao.saveCollection(collection)
})
