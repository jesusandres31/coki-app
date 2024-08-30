onRecordBeforeCreateRequest((e) => {
  // const admin = e.httpContext.get('admin');
  const authRecord = e.httpContext.get('authRecord');
  const userId = authRecord?.id; /* || admin?.id */

  // handle create
  e.record.set('created_by', userId);
});
