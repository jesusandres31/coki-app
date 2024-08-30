/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("kgipq57hx2r1m59")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nt9menhq",
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
  const collection = dao.findCollectionByNameOrId("kgipq57hx2r1m59")

  // remove
  collection.schema.removeField("nt9menhq")

  return dao.saveCollection(collection)
})
