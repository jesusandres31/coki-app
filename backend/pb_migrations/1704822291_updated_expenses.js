/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("sxpqtn1denra6i1")

  // remove
  collection.schema.removeField("ypzfvehc")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("sxpqtn1denra6i1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ypzfvehc",
    "name": "expense_concept_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "kwdd38162sppmaj",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
