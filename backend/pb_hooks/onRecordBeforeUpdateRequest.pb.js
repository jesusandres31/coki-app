onRecordUpdateRequest((e) => {
  const userId = e.auth?.isSuperuser?.() ? null : e.auth?.id;
  const data = e.requestInfo().data;
  const hasField = (name) => {
    try {
      return Boolean(e.collection?.fields?.getByName(name));
    } catch {
      return false;
    }
  };

  // handle update
  if (userId && hasField('updated_by')) {
    e.record?.set('updated_by', userId);
  }

  // handle soft delete marker
  if (data?.delete) {
    if (userId && hasField('deleted_by')) {
      e.record?.set('deleted_by', userId);
    }
    if (hasField('deleted')) {
      e.record?.set('deleted', new Date());
    }
  }

  e.next();
});
