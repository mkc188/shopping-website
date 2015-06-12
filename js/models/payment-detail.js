define(['model'], function (Model) {
  return Model.extend({
    name: 'payment-details',
    defaults: {
      id: null,
      name: '',
      quantity: 0,
      price: 0.0,
      photo: '',
      subtotal: 0.0
    }
  });
});
