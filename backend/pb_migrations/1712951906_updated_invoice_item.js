/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cbusqm5pbt7nh92")

  // remove
  collection.schema.removeField("jzzkgizz")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cbusqm5pbt7nh92")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jzzkgizz",
    "name": "paid",
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
