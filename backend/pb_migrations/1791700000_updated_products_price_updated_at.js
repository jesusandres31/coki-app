/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("d7owddkjq6byksd")

  // add field
  collection.fields.add(new Field({
    "help": "Fecha del último cambio de unit_price (lo setea un hook).",
    "hidden": false,
    "id": "date_price_updated_at",
    "max": "",
    "min": "",
    "name": "price_updated_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("d7owddkjq6byksd")

  // remove field
  collection.fields.removeById("date_price_updated_at")

  return app.save(collection)
})
