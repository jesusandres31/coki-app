/// <reference path="../pb_data/types.d.ts" />

const viewQuery = (includeDeletedItems) => `
SELECT
  i.id,
  i.date,
  i.discount,
  i.total,
  s.name AS state,
  JSON_OBJECT(
    'id', c.id,
    'name', c.name
  ) AS client,
  COALESCE((
    SELECT JSON_GROUP_ARRAY(
      JSON_OBJECT(
        'id', ii.id,
        'product_id', ii.product,
        'product_name', p.name,
        'unit_price', ii.unit_price,
        'amount', ii.amount,
        'discount', ii.discount,
        'total', ii.total
      )
    )
    FROM invoices_products ii
    LEFT JOIN products p
      ON p.id = ii.product
    WHERE ii.invoice = i.id
      ${includeDeletedItems ? "" : "AND ii.deleted = ''"}
  ), JSON('[]')) AS invoice_products,
  i.created,
  i.updated,
  i.deleted
FROM invoices i
LEFT JOIN invoicestates s
  ON s.id = i.state
LEFT JOIN clients c
  ON c.id = i.client
WHERE i.deleted = '';
`;

migrate((app) => {
  const collection = app.findCollectionByNameOrId("v_invoices");
  collection.viewQuery = viewQuery(false);

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("v_invoices");
  collection.viewQuery = viewQuery(true);

  return app.save(collection);
});
