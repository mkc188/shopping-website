define(['collection', 'models/payment-detail'], function (Collection, Model) {
  return Collection.extend({
    name: 'payment-details',
    model: Model
  });
});
