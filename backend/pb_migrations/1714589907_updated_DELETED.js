/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kgipq57hx2r1m59")

  collection.name = "deleted"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kgipq57hx2r1m59")

  collection.name = "DELETED"

  return dao.saveCollection(collection)
})
