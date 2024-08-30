/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "aha7fj57",
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
  const collection = dao.findCollectionByNameOrId("r6ik37a3gxmq3fh")

  // remove
  collection.schema.removeField("aha7fj57")

  return dao.saveCollection(collection)
})
