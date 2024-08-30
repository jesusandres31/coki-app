/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("oit1426bxc4n50d")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "k734u9if",
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
  const collection = dao.findCollectionByNameOrId("oit1426bxc4n50d")

  // remove
  collection.schema.removeField("k734u9if")

  return dao.saveCollection(collection)
})
