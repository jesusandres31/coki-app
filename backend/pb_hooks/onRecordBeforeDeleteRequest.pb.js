onRecordDeleteRequest((e) => {
  // https://github.com/pocketbase/pocketbase/discussions/2694
  const deletedCollectionName = 'x_deleted';

  // Add other collection names here where you don't want to keep a copy of the deleted record
  const excludedCollections = [deletedCollectionName];

  // Skip if the record is already deleted or in excluded collections
  if (excludedCollections.includes(e.collection?.name)) {
    return e.next();
  }

  try {
    const collection = e.app.findCollectionByNameOrId(deletedCollectionName);
    const userId = e.auth?.isSuperuser?.() ? null : e.auth?.id;

    const payload = {
      collection: e.collection?.name,
      record: e.record,
    };

    if (userId) {
      payload.deleted_by = userId;
    }

    const record = new Record(collection, payload);

    e.app.save(record);
  } catch (err) {
    throw new BadRequestError(`Error creating deleted record: ${err}`);
  }

  e.next();
});
