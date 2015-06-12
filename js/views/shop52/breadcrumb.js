define([
  'view',
  'hbs!templates/shop52/breadcrumb'
], function (View, template) {
  return View.extend({
    name: 'shop52/breadcrumb',
    template: template,
    initialize: function(options) {
      this.collection = new Thorax.Collection({name: 'Home', href: '#'});
      this.collection.add(options);
    },
    events: {
      'unwrap': function() {
        this.$('ul.breadcrumb li:last-child a').contents().unwrap();
        this.$('ul.breadcrumb li:last-child').addClass('active');
      }
    }
  });
});
