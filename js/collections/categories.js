define(['collection', 'models/category'], function(Collection, Model) {
  return Collection.extend({
    name: 'categories',
    model: Model,
    url: '/api/categories'
  });
});
