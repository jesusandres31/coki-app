onRecordBeforeDeleteRequest((e) => {
  // https://github.com/pocketbase/pocketbase/discussions/2694
  const deletedCollectionName = 'x_deleted';

  // Add other collection names here where you don't want to keep a copy of the deleted record
  const excludedCollections = [deletedCollectionName];

  // Skip if the record is already deleted or in excluded collections
  if (excludedCollections.includes(e.collection.name)) {
    return;
  }

  try {
    const collection = $app
      .dao()
      .findCollectionByNameOrId(deletedCollectionName);

    const admin = e.httpContext.get('admin');
    const authRecord = e.httpContext.get('authRecord');
    const userId = authRecord?.id || admin?.id;

    const record = new Record(collection, {
      collection: e.collection.name,
      record: e.record,
      deleted_by: userId,
    });

    $app.dao().saveRecord(record);
  } catch (err) {
    throw new BadRequestError(`Error creating deleted record: ${err}`);
  }
});
