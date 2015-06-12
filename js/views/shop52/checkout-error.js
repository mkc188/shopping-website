define([
  'view',
  'hbs!templates/shop52/checkout-error'
], function (View, template) {
  return View.extend({
    name: 'shop52/checkout-error',
    template: template,
    model: new Thorax.Model({}),
    initialize: function(options) {
      this.model.set({token: options.token});
    }
  });
});
