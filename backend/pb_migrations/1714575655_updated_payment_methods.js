/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zbjxrh94",
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
  const collection = dao.findCollectionByNameOrId("hrt7u01irqlx0n8")

  // remove
  collection.schema.removeField("zbjxrh94")

  return dao.saveCollection(collection)
})
