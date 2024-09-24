/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d7owddkjq6byksd")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v8uepzwj",
    "name": "measure_unit",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "defnylqa6c3g49s",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d7owddkjq6byksd")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v8uepzwj",
    "name": "measureUnit",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "defnylqa6c3g49s",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
