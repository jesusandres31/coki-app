/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wabqv9usgiljong")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ufnql05z",
    "name": "canteen",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "l6ser6vmmuntz9a",
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
  collection.schema.removeField("ufnql05z")

  return dao.saveCollection(collection)
})
