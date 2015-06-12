define([
  'view',
  'hbs!templates/shop52/checkout'
], function (View, template) {
  return View.extend({
    name: 'shop52/checkout',
    template: template,
    initialize: function(options) {
      this.collection = options.collection;
    },
    events: {
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
        $('#loading').hide();
        this.collection.fetch();
        $("input[name='change-quantity']").TouchSpin({
          min: 1,
          max: 100
        });
        this.$('#basket').text(this.collection.length);
        this.$('#total').text(this.collection.total());
      }
    },
    paypalCheckout: function(event) {
      $('#loading').show();
      var idArray = localStorage.getItem('CartItems').split(',');
      var cartArray = [];
      for (var i = 0; i < idArray.length; i++) {
        cartArray.push(JSON.parse(localStorage.getItem('CartItems-' + idArray[i])));
      }
      $.ajax({
        url: 'checkout',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          'cart': cartArray
        }),
        success: function(res) {
          window.location.replace(res[1].href);
        }
      });
    }
  });
});
