/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l6ser6vmmuntz9a")

  // remove
  collection.schema.removeField("w8fljcoj")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l6ser6vmmuntz9a")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w8fljcoj",
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
})
