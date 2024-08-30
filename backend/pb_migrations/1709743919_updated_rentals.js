/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("okro6dwifudi6ee")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hlbpppc4",
    "name": "ball",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "r6ik37a3gxmq3fh",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("okro6dwifudi6ee")

  // remove
  collection.schema.removeField("hlbpppc4")

  return dao.saveCollection(collection)
})
