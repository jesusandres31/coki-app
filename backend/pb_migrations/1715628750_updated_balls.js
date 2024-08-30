/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xajnzr7u",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "78gvqmad",
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
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  // remove
  collection.schema.removeField("xajnzr7u")

  // remove
  collection.schema.removeField("78gvqmad")

  return dao.saveCollection(collection)
})
