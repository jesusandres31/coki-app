/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qv8hjuuo",
    "name": "price_per_hour",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qv8hjuuo",
    "name": "price_per_hour",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
})
