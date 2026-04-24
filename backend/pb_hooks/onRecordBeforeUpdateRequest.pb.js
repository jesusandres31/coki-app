onRecordUpdateRequest((e) => {
  const userId = e.auth?.isSuperuser?.() ? null : e.auth?.id;
  const data = e.requestInfo().data;

  // handle update
  if (userId) {
    e.record?.set('updated_by', userId);
  }

  // handle soft delete marker
  if (data?.delete) {
    if (userId) {
      e.record?.set('deleted_by', userId);
    }
    e.record?.set('deleted', new Date());
  }

  e.next();
});
