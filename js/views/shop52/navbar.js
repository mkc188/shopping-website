define([
  'view',
  'models/product',
  'hbs!templates/shop52/navbar'
], function (View, ProductModel, template) {
  return View.extend({
    name: 'shop52/navbar',
    template: template,

    events: {
      'click .dropdown-menu': function (event) {
        event.stopPropagation();
      },
      collection: {
        all: function (event) {
          $("input[name='change-quantity']").TouchSpin({
            min: 1,
            max: 100
          });
          this.$('#basket').text(this.collection.length);
          this.$('#total').text(this.collection.total());
        },
      },
      'change input[name="change-quantity"]': function (event) {
        event.preventDefault();
        target = this.collection.get($(event.currentTarget).data("id"));
        qty = parseInt($(event.currentTarget).val());
        newModel = target.set({
          quantity: qty,
          subtotal: (qty * target.get('price')).toFixed(2)
        });
        this.collection.add(newModel, {
          merge: true
        });
        newModel.save();
      },
      'click .remove-item': function (event) {
        event.preventDefault();
        target = this.collection.get($(event.currentTarget).data("id"));
        target.destroy();
        this.collection.remove(target);
      },
      ready: function (event) {
        this.collection.fetch();

        this.collection.each(function(target) {
          var model = new ProductModel({
            id: target.get('id')
          });
          model.fetch({
            success: function() {
              target.set({
                'price': model.get('price'),
                'name': model.get('name'),
                'subtotal': (model.get('price') * target.get('quantity')).toFixed(2)
              });
              target.save();
            }
          });
        });
        $("input[name='change-quantity']").TouchSpin({
          min: 1,
          max: 100
        });
        this.$('#basket').text(this.collection.length);
        this.$('#total').text(this.collection.total());
      }
    }
  });
});
