define([
  'view',
  'collection',
  'views/shop52/breadcrumb',
  'views/shop52/category',
  'collections/categories',
  'models/category',
  'models/cart-item',
  'hbs!templates/shop52/index'
], function (View, Collection, BreadCrumb, Category, CategoryCollection, CategoryModel, CartItemModel, template) {
  return View.extend({
    name: 'shop52/index',
    template: template,

    initialize: function(options) {
      var that = this;

      var collection = new CategoryCollection();
      collection.on('sync', function(event) {
        if (catname = this.get(options.cat)) {
          that.breadcrumb.collection.add({
            name: catname.get('name'),
            href: '#category/' + catname.get('id') + '-' + catname.get('name')
          });
        }
        if (options.info) {
          that.breadcrumb.collection.add({
            name: options.content.model.get('name'),
            href: '#'
          })
        }
        that.breadcrumb.trigger('unwrap');
      });

      this.category = new Category({
        collection: collection
      });

      this.breadcrumb = new BreadCrumb();

      this.content = options.content;

      this.content.on('click .add-to-cart', function(event) {
        event.preventDefault();
        target = options.content.collection.get($(event.currentTarget).data("id"));

        if (that.parent.navbar.collection.get(target.get('id'))) {
          var input = $('input[name="change-quantity"]');
          target = that.parent.navbar.collection.get(target.get('id'));
          qty = target.get('quantity') + 1;
          newModel = target.set({
            quantity: qty,
            subtotal: (qty * target.get('price')).toFixed(2)
          });
          that.parent.navbar.collection.add(newModel, {
            merge: true
          });
          newModel.save();
        } else {
          cartItem = new CartItemModel({
            id: target.get('id'),
            name: target.get('name'),
            quantity: 1,
            price: target.get('price'),
            subtotal: target.get('price')
          });
          that.parent.navbar.collection.add(cartItem);
          cartItem.save();
        }
      });
    },
    events: {
      ready: function() {
        $(document).scrollTop(0);
      }
    }
  });
});
