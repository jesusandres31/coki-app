/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("d7owddkjq6byksd")

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1454256526",
    "help": "",
    "hidden": false,
    "id": "relation20346248",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "product_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("d7owddkjq6byksd")

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1454256526",
    "help": "",
    "hidden": false,
    "id": "relation20346248",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "product_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
