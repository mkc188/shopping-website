define(['collection', 'models/product'], function(Collection, Model) {
  return Collection.extend({
    name: 'products',
    model: Model,
    url: '/api/products'
  });
});
