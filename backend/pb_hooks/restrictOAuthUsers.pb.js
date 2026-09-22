/// <reference path="../pb_data/types.d.ts" />

onRecordAuthWithOAuth2Request((e) => {
  if (e.isNewRecord) {
    throw new ForbiddenError(
      'Tu cuenta no está habilitada para ingresar al sistema.',
    );
  }

  e.next();
}, 'users');
