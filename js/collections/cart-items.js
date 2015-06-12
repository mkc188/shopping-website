define(['collection', 'models/cart-item', 'localstorage'], function (Collection, Model) {
  return Collection.extend({
    name: 'cart-items',
    localStorage: new Backbone.LocalStorage("CartItems"),
    model: Model,
    total: function () {
      var total = 0;
      this.each(function (model) {
        total += parseFloat(model.get('subtotal'));
      });
      return total.toFixed(2);
    }
  });
});
