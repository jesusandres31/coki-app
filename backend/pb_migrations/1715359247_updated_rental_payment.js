/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zxr4tpivf9nff1q")

  collection.name = "rentals_payments"
  collection.indexes = [
    "CREATE INDEX `idx_J3gTcMn` ON `rentals_payments` (`rental`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zxr4tpivf9nff1q")

  collection.name = "rental_payment"
  collection.indexes = [
    "CREATE INDEX `idx_J3gTcMn` ON `rental_payment` (`rental`)"
  ]

  return dao.saveCollection(collection)
})
