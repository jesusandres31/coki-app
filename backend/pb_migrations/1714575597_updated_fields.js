/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9ue2dsz8",
    "name": "deleted",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv")

  // remove
  collection.schema.removeField("9ue2dsz8")

  return dao.saveCollection(collection)
})
