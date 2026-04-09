/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wabqv9usgiljong")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i5jmasls",
    "name": "state",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "x93unrz0eq3eda1",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wabqv9usgiljong")

  // remove
  collection.schema.removeField("i5jmasls")

  return dao.saveCollection(collection)
})
