/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d7owddkjq6byksd")

  // remove
  collection.schema.removeField("e3rlaoqd")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("d7owddkjq6byksd")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "e3rlaoqd",
    "name": "stock",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
})
