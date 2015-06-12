define([
  'view',
  'hbs!templates/shop52/pagination'
], function (View, template) {
  return View.extend({
    name: 'shop52/pagination',
    template: template,
    model: new Thorax.Model({}),
    initialize: function() {
      var link = Backbone.history.fragment;
      if (/^((?!(category)).)*$/.test(link)) {
        this.model.set({
          route: link + 'page/'
        })
      } else {
        this.model.set({
          route: link + '/page/'
        })
      }
      var number = parseInt(link.substr(link.lastIndexOf('/') + 1));
      var prev = number - 1;
      var next = number + 1;
      if (number > 1) {
        if (link.indexOf('page') != -1) {
          this.model.set({
            route: link.replace(/\/[^\/]*$/, '/'),
            prev: parseInt(link.substr(link.lastIndexOf('/') + 1)) - 1,
            next: parseInt(link.substr(link.lastIndexOf('/') + 1)) + 1
          });
        } else {
          this.model.set({
            prev: link.replace(/\/[^\/]*$/, '/' + prev),
            next: link.replace(/\/[^\/]*$/, '/' + next)
          });
        }
      } else {
        if (link.indexOf('page') != -1) {
          this.model.set({
            route: link.replace(/\/[^\/]*$/, '/')
          });
        }
        this.model.set({
          next: 2,
          prev: 1
        });
      }
    }
  });
});
