/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1454256526")

  // update collection data
  unmarshal({
    "name": "product_types"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1454256526")

  // update collection data
  unmarshal({
    "name": "product_type"
  }, collection)

  return app.save(collection)
})
