/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("okro6dwifudi6ee")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "3fqu2wpf",
    "name": "deleted_by",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
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
  collection.schema.removeField("3fqu2wpf")

  return dao.saveCollection(collection)
})
