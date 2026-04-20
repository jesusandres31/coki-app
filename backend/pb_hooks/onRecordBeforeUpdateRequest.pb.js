onRecordUpdateRequest((e) => {
  const userId = e.auth?.id;
  const data = e.requestInfo().data;

  // handle update
  e.record?.set('updated_by', userId);

  // handle soft delete marker
  if (data?.delete) {
    e.record?.set('deleted_by', userId);
    e.record?.set('deleted', new Date());
  }

  e.next();
});
