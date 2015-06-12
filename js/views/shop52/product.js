define([
  'view',
  'models/cart-item',
  'hbs!templates/shop52/product'
], function (View, CartItemModel, template) {
  return View.extend({
    name: 'shop52/product',
    template: template,

    events: {
      ready: function() {
        $(document).scrollTop(0);
      },
      'click #cart': function(event) {
        event.preventDefault();

        if (this.parent.parent.navbar.collection.get(this.model.get('id'))) {
          var input = $('input[name="change-quantity"]');
          target = this.parent.parent.navbar.collection.get(this.model.get('id'));
          qty = target.get('quantity') + 1;
          newModel = target.set({
            quantity: qty,
            subtotal: (qty * target.get('price')).toFixed(2)
          });
          this.parent.parent.navbar.collection.add(newModel, {
            merge: true
          });
          newModel.save();
        } else {
          cartItem = new CartItemModel({
            id: this.model.get('id'),
            name: this.model.get('name'),
            quantity: 1,
            price: this.model.get('price'),
            subtotal: this.model.get('price')
          });
          this.parent.parent.navbar.collection.add(cartItem);
          cartItem.save();
        }
      }
    }
  });
});
