define(['app', 'model', 'models/user'], function (app, Model, UserModel) {
  return Model.extend({
    name: 'session',
    // Initialize with negative/empty defaults
    // These will be overriden after the initial checkAuth
    defaults: {
      logged_in: false,
      user_id: ''
    },
    initialize: function () {
      // Singleton user object
      // Access or listen on this throughout any module with app.session.user
      this.user = new UserModel({});
    },
    url: function () {
      return app.API + '/auth';
    },

    // Fxn to update user attributes after recieving API response
    updateSessionUser: function (userData) {
      this.user.set(_.pick(userData, _.keys(this.user.defaults)));
    },

    /*
     * Check for session from API
     * The API will parse client cookies using its secret token
     * and return a user object if authenticated
     */
    checkAuth: function (callback, args) {
      var self = this;
      $.ajaxSetup({
        cache: false
      });
      this.fetch({
        success: function (mod, res) {
          if (!res.error && res.user) {
            self.updateSessionUser(res.user);
            if (res.user.admin) {
              self.set({
                logged_in: true
              });
              if ('success' in callback) callback.success(mod, res);
            } else {
              self.set({
                logged_in: false
              });
              if ('success' in callback) callback.error(mod, res);
            }
          } else {
            self.set({
              logged_in: false
            });
            if ('error' in callback) callback.error(mod, res);
          }

          if ('complete' in callback) callback.complete();
        },
        error: function (mod, res) {
          self.set({
            logged_in: false
          });
          if ('error' in callback) callback.error(mod, res);

          if ('complete' in callback) callback.complete();
        }
      }).complete(function () {
        if ('complete' in callback) callback.complete();
      });
      $.ajaxSetup({
        cache: true
      });
    },

    /*
     * Abstracted fxn to make a POST request to the auth endpoint
     * This takes care of the CSRF header for security, as well as
     * updating the user and session after receiving an API response
     */
    postAuth: function (opts, callback, args) {
      var self = this;
      var postData = _.omit(opts, 'method');
      $.ajax({
        url: this.url() + '/' + opts.method,
        contentType: 'application/json',
        dataType: 'json',
        type: 'POST',
        beforeSend: function (xhr) {
          // Set the CSRF Token in the header for security
          var token = $('meta[name="csrf-token"]').attr('content');
          if (token) xhr.setRequestHeader('X-CSRF-Token', token);
        },
        data: JSON.stringify(_.omit(opts, 'method')),
        success: function (res) {
          $('meta[name="csrf-token"]').attr("content", res.csrf);
          if (!res.error) {
            if (_.indexOf(['login', 'signup'], opts.method) !== -1) {

              self.updateSessionUser(res.user || {});
              self.set({
                user_id: res.user.id,
                logged_in: true
              });
            } else {
              self.set({
                logged_in: false
              });
            }

            if (callback && 'success' in callback) callback.success(res);
          } else {
            if (callback && 'error' in callback) callback.error(res);
          }
        },
        error: function (mod, res) {
          if (callback && 'error' in callback) callback.error(res);
        }
      }).complete(function () {
        if (callback && 'complete' in callback) callback.complete(res);
      });
    },

    login: function (opts, callback, args) {
      this.postAuth(_.extend(opts, {
        method: 'login'
      }), callback);
    },

    logout: function (opts, callback, args) {
      this.postAuth(_.extend(opts, {
        method: 'logout'
      }), callback);
    },

    signup: function (opts, callback, args) {
      this.postAuth(_.extend(opts, {
        method: 'signup'
      }), callback);
    },

    removeAccount: function (opts, callback, args) {
      this.postAuth(_.extend(opts, {
        method: 'remove_account'
      }), callback);
    },

    changepw: function (opts, callback, args) {
      this.postAuth(_.extend(opts, {
        method: 'changepw'
      }), callback);
    }
  });
});
