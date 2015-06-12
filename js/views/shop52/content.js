define([
  'view',
  'views/shop52/pagination',
  'hbs!templates/shop52/content'
], function (View, Pagination, template) {
  return View.extend({
    name: 'shop52/content',
    template: template,

    initialize: function() {
      this.pagination = new Pagination;
    },

    events: {
      ready: function() {
        $(document).scrollTop(0);
      }
    }
  });
});
