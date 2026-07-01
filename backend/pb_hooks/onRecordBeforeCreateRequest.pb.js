onRecordCreateRequest((e) => {
  const userId = e.auth?.isSuperuser?.() ? null : e.auth?.id;

  if (e.collection?.name === 'payment_account_movements') {
    try {
      const clientId = e.record?.get('client');
      const typeId = e.record?.get('type');
      const enteredValue = Number(e.record?.get('delta') || 0);

      if (!clientId || !typeId) {
        throw new BadRequestError('Client and movement type are required.');
      }

      const client = e.app.findRecordById('clients', clientId);
      const type = e.app.findRecordById('payment_account_movement_types', typeId);
      const typeName = String(type.get('name') || '');
      const balanceBefore = Number(client.get('balance') || 0);
      const delta =
        typeName === 'payment'
          ? -Math.abs(enteredValue)
          : typeName === 'debt'
            ? Math.abs(enteredValue)
            : enteredValue - balanceBefore;
      const balanceAfter =
        typeName === 'adjustment' ? enteredValue : balanceBefore + delta;

      e.record.set('delta', Number(delta.toFixed(2)));
      e.record.set('balance_before', Number(balanceBefore.toFixed(2)));
      e.record.set('balance_after', Number(balanceAfter.toFixed(2)));

      e.next();

      client.set('balance', Number(balanceAfter.toFixed(2)));
      e.app.save(client);
      return;
    } catch (err) {
      throw new BadRequestError(`Error creating payment account movement: ${err}`);
    }
  }

  // handle create
  if (userId) {
    e.record?.set('created_by', userId);
  }
  e.next();
});
