/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("wabqv9usgiljong")

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "x93unrz0eq3eda1",
    "help": "",
    "hidden": false,
    "id": "i5jmasls",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "state",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("wabqv9usgiljong")

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "x93unrz0eq3eda1",
    "help": "",
    "hidden": false,
    "id": "i5jmasls",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "state",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
