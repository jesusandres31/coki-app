/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("okro6dwifudi6ee")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jqbat1hf",
    "name": "discount_percentage",
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
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("okro6dwifudi6ee")

  // remove
  collection.schema.removeField("jqbat1hf")

  return dao.saveCollection(collection)
})
