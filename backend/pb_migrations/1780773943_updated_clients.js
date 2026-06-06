/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("3ghq3okw4e9u3h7")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "number2901680126",
    "max": null,
    "min": null,
    "name": "balance",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("3ghq3okw4e9u3h7")

  // remove field
  collection.fields.removeById("number2901680126")

  return app.save(collection)
})
