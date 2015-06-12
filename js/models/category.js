define(['model'], function (Model) {
  return Model.extend({
    name: 'category',
    urlRoot: '/api/categories',
    defaults: {
      id: null,
      name: ''
    }
  });
});
