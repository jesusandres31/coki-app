/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("d7owddkjq6byksd")
  const field = collection.fields.getByName("product_type")

  field.required = false

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("d7owddkjq6byksd")
  const field = collection.fields.getByName("product_type")

  field.required = true

  return app.save(collection)
})
