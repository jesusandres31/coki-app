/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("56z03agvzy6zfgy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oaclvvus",
    "name": "payment_method",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "hrt7u01irqlx0n8",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("56z03agvzy6zfgy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oaclvvus",
    "name": "paymen_method",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "hrt7u01irqlx0n8",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
