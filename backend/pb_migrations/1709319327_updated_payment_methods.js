/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "h8mnx2kh",
    "name": "detail",
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
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8")

  // remove
  collection.schema.removeField("h8mnx2kh")

  return dao.saveCollection(collection)
})
