/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kwdd38162sppmaj")

  collection.name = "expenseConcepts"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kwdd38162sppmaj")

  collection.name = "expense_concepts"

  return dao.saveCollection(collection)
})
