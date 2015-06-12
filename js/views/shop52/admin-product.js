define([
  'view',
  'collections/products',
  'hbs!templates/shop52/admin-product'
], function (View, ProductCollection, template) {
  return View.extend({
    name: 'shop52/adminProduct',
    template: template,
    initialize: function() {
      this.collection = new ProductCollection();
    },
    events: {
      'selectOption': function(option) {
        this.$('#select-product').val(option);
      }
    }
  });
});
