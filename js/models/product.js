define(['model'], function (Model) {
  return Model.extend({
    name: 'product',
    urlRoot: '/api/products',
    defaults: {
      id: null,
      catid: null,
      name: '',
      price: 0.0,
      description: '',
      photo: ''
    }
  });
});
