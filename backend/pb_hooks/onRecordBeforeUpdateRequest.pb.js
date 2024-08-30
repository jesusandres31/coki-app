onRecordBeforeUpdateRequest((e) => {
  // const admin = e.httpContext.get('admin');
  const authRecord = e.httpContext.get('authRecord');
  const userId = authRecord?.id; /* || admin?.id */
  const data = $apis.requestInfo(e.httpContext).data;

  // handle update
  e.record.set('updated_by', userId);

  // handle delete
  if (data.delete) {
    e.record.set('deleted_by', userId);
    e.record.set('deleted', new Date());
  }
});
