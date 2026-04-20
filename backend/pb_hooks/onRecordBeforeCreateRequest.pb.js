onRecordCreateRequest((e) => {
  const userId = e.auth?.id;

  // handle create
  e.record?.set('created_by', userId);
  e.next();
});
