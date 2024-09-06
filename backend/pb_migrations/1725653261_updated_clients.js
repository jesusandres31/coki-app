/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3ghq3okw4e9u3h7")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9qpaxopt",
    "name": "address",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3ghq3okw4e9u3h7")

  // remove
  collection.schema.removeField("9qpaxopt")

  return dao.saveCollection(collection)
})
