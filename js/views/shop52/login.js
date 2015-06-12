define([
  'app',
  'view',
  'hbs!templates/shop52/login'
], function (app, View, template) {
  return View.extend({
    name: 'shop52/login',
    template: template,

    events: {
      'submit #login-form': 'onLoginAttempt',
      'submit #signup-form': 'onSignupAttempt',
    },

    onLoginAttempt: function (evt) {
      if (evt) evt.preventDefault();

      app.session.login({
        username: this.$("#login-username-input").val(),
        password: this.$("#login-password-input").val()
      }, {
        success: function (res) {
          // console.log("SUCCESS", mod, res);
          if (res.user.admin) {
            Backbone.history.navigate("/admin", {
              trigger: true,
              replace: true
            });
          } else {
            var rgx = /#account\/login\/(\w+)/g;
            var match = rgx.exec(window.location.hash);
            if (match && match[1] == 'checkout') {
              Backbone.history.navigate("/checkout", {
                trigger: true,
                replace: true
              });
            } else {
              Backbone.history.navigate("/account", {
                trigger: true,
                replace: true
              });
            }
          }
        },
        error: function (err) {
          // console.log("ERROR", err);
          app.showAlert('Bummer dude!', err.error, 'alert-danger');
        }
      });
    },

    onSignupAttempt: function (evt) {
      if (evt) evt.preventDefault();
      app.session.signup({
        username: this.$("#signup-username-input").val(),
        password: this.$("#signup-password-input").val(),
        passwordConfirm: this.$("#signup-password-confirm-input").val()
      }, {
        success: function (res) {
          // console.log("SUCCESS", mod, res);
          Backbone.history.navigate("/admin", {
            trigger: true,
            replace: true
          });
        },
        error: function (err) {
          // console.log("ERROR", err);
          app.showAlert('Uh oh!', err.error, 'alert-danger');
        }
      });
    },
  });
});
