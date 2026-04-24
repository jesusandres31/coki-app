onRecordCreateRequest((e) => {
  const userId = e.auth?.isSuperuser?.() ? null : e.auth?.id;

  // handle create
  if (userId) {
    e.record?.set('created_by', userId);
  }
  e.next();
});
