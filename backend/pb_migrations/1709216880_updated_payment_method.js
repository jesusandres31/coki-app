/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8")

  collection.name = "payment_methods"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8")

  collection.name = "payment_method"

  return dao.saveCollection(collection)
})
