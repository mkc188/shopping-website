define(['model'], function (Model) {
  return Model.extend({
    name: 'payment',
    urlRoot: '/api/payments',
    defaults: {
      id: null
    }
  });
});
