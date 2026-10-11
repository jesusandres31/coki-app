/// <reference path="../pb_data/types.d.ts" />

// Stamp price_updated_at whenever a product's unit_price changes, regardless
// of which screen (or script) saved it. Invoices use it to decide whether the
// catalog price is newer than the last price charged to a client.
onRecordUpdate((e) => {
  const previousPrice = Number(e.record.original().get('unit_price') || 0);
  const nextPrice = Number(e.record.get('unit_price') || 0);

  if (previousPrice !== nextPrice) {
    e.record.set('price_updated_at', new Date().toISOString());
  }

  e.next();
}, 'products');
