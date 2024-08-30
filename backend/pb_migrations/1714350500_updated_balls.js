/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cffdstzn",
    "name": "field",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "e0yuy3qavvulbgv",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  // remove
  collection.schema.removeField("cffdstzn")

  return dao.saveCollection(collection)
})
