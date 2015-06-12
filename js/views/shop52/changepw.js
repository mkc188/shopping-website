define([
  'app',
  'view',
  'hbs!templates/shop52/changepw'
], function (app, View, template) {
  return View.extend({
    name: 'shop52/changepw',
    template: template,

    events: {
      'submit #changepw-form': 'onChangepwAttempt',
    },
    onChangepwAttempt: function (e) {
      e.preventDefault();

      app.session.changepw({
        username: this.$("#changepw-username-input").val(),
        password: this.$("#changepw-password-input").val(),
        passwordConfirm: this.$("#changepw-password-confirm-input").val()
      }, {
        success: function (res) {
          // console.log("SUCCESS", res);
          Backbone.history.navigate("/admin/login", {
            trigger: true,
            replace: true
          });
        },
        error: function (err) {
          console.log("ERROR", err);
        }
      });

      this.$('input[type="password"]').val('');
    },
  });
});
