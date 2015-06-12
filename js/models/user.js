define(['app', 'model'], function (app, Model) {
  return Model.extend({
    name: 'user',
    defaults: {
      id: null,
      username: '',
      admin: false
    },
    url: function () {
      return app.API + '/user';
    }
  });
});
