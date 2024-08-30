/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  "GET",
  "/main",
  (c) => {
    return c.json(200, { message: "Hello world" });
  },
  $apis.requireRecordAuth()
);
