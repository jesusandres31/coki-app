/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wabqv9usgiljong")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "h31u3a4d",
    "name": "location",
    "type": "relation",
    "required": true,
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
  const collection = dao.findCollectionByNameOrId("wabqv9usgiljong")

  // remove
  collection.schema.removeField("h31u3a4d")

  return dao.saveCollection(collection)
})
