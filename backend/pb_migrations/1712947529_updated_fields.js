/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "exwndsi8",
    "name": "location",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "zb02tu64wtql7y7",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("e0yuy3qavvulbgv")

  // remove
  collection.schema.removeField("exwndsi8")

  return dao.saveCollection(collection)
})
