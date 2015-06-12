define(['model'], function (Model) {
  return Model.extend({
    name: 'cart-item',
    defaults: {
      id: null,
      name: '',
      quantity: 0,
      price: 0.0,
      subtotal: 0.0
    }
  });
});
