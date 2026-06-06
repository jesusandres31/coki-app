/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("ur14h8gcnpxdzyv");

  unmarshal({
    "options": {
      "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  s.name AS state,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE((\n    SELECT JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', ii.product,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    )\n    FROM invoices_products ii\n    LEFT JOIN products p\n      ON p.id = ii.product\n    WHERE ii.invoice = i.id\n      AND ii.deleted = ''\n  ), JSON('[]')) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN invoicestates s\n  ON s.id = i.state\nLEFT JOIN clients c\n  ON c.id = i.client\nWHERE i.deleted = '';\n"
    }
  }, collection);

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("ur14h8gcnpxdzyv");

  unmarshal({
    "options": {
      "query": "SELECT\n  i.id,\n  i.date,\n  i.discount,\n  i.total,\n  s.name AS state,\n  JSON_OBJECT(\n    'id', c.id,\n    'name', c.name\n  ) AS client,\n  COALESCE((\n    SELECT JSON_GROUP_ARRAY(\n      JSON_OBJECT(\n        'id', ii.id,\n        'product_id', ii.product,\n        'product_name', p.name,\n        'unit_price', ii.unit_price,\n        'amount', ii.amount,\n        'discount', ii.discount,\n        'total', ii.total\n      )\n    )\n    FROM invoices_products ii\n    LEFT JOIN products p\n      ON p.id = ii.product\n    WHERE ii.invoice = i.id\n  ), JSON('[]')) AS invoice_products,\n  i.created,\n  i.updated,\n  i.deleted\nFROM invoices i\nLEFT JOIN invoicestates s\n  ON s.id = i.state\nLEFT JOIN clients c\n  ON c.id = i.client\nWHERE i.deleted = '';\n"
    }
  }, collection);

  return app.save(collection);
});
