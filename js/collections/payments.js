define(['collection', 'models/payment'], function (Collection, Model) {
  return Collection.extend({
    name: 'payments',
    model: Model,
    url: '/api/payments'
  });
});
