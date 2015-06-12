define([
  'app',
  'view',
  'models/payment',
  'collections/payments',
  'models/product',
  'models/payment-detail',
  'collections/payment-details',
  'views/shop52/changepw',
  'hbs!templates/shop52/account'
], function(app, View, PaymentModel, PaymentCollection, ProductModel, PaymentDetailModel, PaymentDetailCollection, ChangepwView, template) {
  return View.extend({
    name: 'shop52/account',
    template: template,
    model: new Thorax.Model({
      total: 0.0
    }),
    options: {
      populate: false
    },
    paymentCollection: new PaymentCollection([]),
    events: {
      "click #logout-link": function(event) {
        event.preventDefault();
        app.session.logout({}, {
          success: function() {
            Backbone.history.navigate("/admin/login", {
              trigger: true,
              replace: true
            });
          }
        }); // No callbacks needed b/c of session event listening
      },
      "click #remove-account-link": function(event) {
        event.preventDefault();
        app.session.removeAccount({}, {
          success: function() {
            Backbone.history.navigate("/admin/login", {
              trigger: true,
              replace: true
            });
          }
        });
      },
      ready: function() {
        $(document).scrollTop(0);
        $('#detail-loading').hide();
      }
    },
    showDetails: function(event) {
      $('#detail-loading').show();
      var that = this;
      var paymentId = $(event.currentTarget).text();
      $.ajax({
        url: 'foo/payment_details',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          paymentId: paymentId
        }),
        success: function(res) {
          if (res.httpStatusCode == 200) {
            that.paymentCollection.reset();
            that.model.set({
              total: 0.0
            });
            var total = res.transactions[0].amount.total;
            var items = res.transactions[0].item_list.items;
            for (var i = 0; i < items.length; i++) {
              var item = items[i];
              var product = new ProductModel({
                id: items[i].sku
              });
              product.fetch({
                async: false
              });
              var t = parseFloat(that.model.get('total'));
              that.model.set({
                'total': parseFloat(t + (item.price * item.quantity)).toFixed(2)
              });
              that.paymentCollection.add(new PaymentDetailModel({
                name: item.name,
                photo: product.get('photo'),
                quantity: item.quantity,
                price: item.price,
                subtotal: (item.price * item.quantity).toFixed(2)
              }));
              that.$('#total').text(that.model.get('total'));
            }
          } else {
            that.paymentCollection.reset();
            that.model.set({
              total: 0.0
            })
            that.$('#total').text(that.model.get('total'));
          }
        },
        complete: function() {
          $('#detail-loading').hide();
        }
      });
    },
    initialize: function() {
      this.changepw = new ChangepwView();
    },
    ready: function() {

    }
  });
});
