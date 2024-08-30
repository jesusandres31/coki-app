/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zxr4tpivf9nff1q")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0q57mrzy",
    "name": "rental",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "okro6dwifudi6ee",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zxr4tpivf9nff1q")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0q57mrzy",
    "name": "rental",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "okro6dwifudi6ee",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
