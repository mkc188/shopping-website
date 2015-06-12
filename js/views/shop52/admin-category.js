define([
  'view',
  'collections/categories',
  'hbs!templates/shop52/admin-category'
], function (View, CategoryCollection, template) {
  return View.extend({
    name: 'shop52/adminCategory',
    template: template,
    initialize: function() {
      this.collection = new CategoryCollection();
    },
    events: {
      'selectOption': function(option) {
        this.$('#select-category').val(option);
      }
    }
  });
});
