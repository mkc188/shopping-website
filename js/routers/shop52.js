define([
  'app',
  'models/session',
  'models/user',
  'backbone',
  'views/root',
  'views/shop52/index',
  'collections/products',
  'collections/payments',
  'views/shop52/product',
  'models/product',
  'models/payment',
  'views/shop52/admin',
  'views/shop52/content',
  'views/shop52/login',
  'views/shop52/checkout',
  'views/shop52/checkout-thankyou',
  'views/shop52/checkout-error',
  'views/shop52/account'
], function (app, SessionModel, UserModel, Backbone, RootView, IndexView, ProductCollection, PaymentCollection, ProductView, ProductModel, PaymentModel, AdminView, ContentView, LoginView, CheckoutView, CheckoutThankyouView, CheckoutErrorView, AccountView) {
  return Backbone.Router.extend({
    routes: {
      "page/:number": "page",
      "account": "account",
      "account/login/checkout": "login",
      "checkout": "checkout",
      "checkout/thankyou": "checkoutThankyou",
      "checkout/error": "checkoutError",
      "checkout/error?token=:token": "checkoutError",
      "admin/login": "login",
      "admin": "admin",
      "product/:id-:pname": "info",
      "category/:id-:catname": "showcat",
      "category/:id-:catname/page/:number": "showcatPage",
      "": "index" //add an index route
        // "": "login" //add an index route
    },
    showcatPage: function(id, catname, number) {
      if (number <= 1) {
        this.showcat(id);
        return;
      }
      var products = new ProductCollection();
      products.fetch({
        data: {catid: id, offset: (number - 1)*10, count: 10},
        success: function() {
          var content = new ContentView({
            collection: products
          });
          var view = new IndexView({
            content: content,
            cat: id
          });
          RootView.getInstance().setView(view);

          if (products.length != 10) {
            $('#next').hide();
          } else {
            $('#next').show();
          }
      }})
    },
    page: function(number) {
      if (number <= 1) {
        this.index();
        return;
      }
      var products = new ProductCollection();
      products.fetch({
        data: {offset: (number - 1)*10, count: 10},
        success: function() {
          var content = new ContentView({
            collection: products
          });
          var view = new IndexView({
            content: content
          });
          RootView.getInstance().setView(view);

          if (products.length != 10) {
            $('#next').hide();
          } else {
            $('#next').show();
          }
      }})
    },
    account: function() {
      var self = this;
      app.session.checkAuth({
        success: function (res) {
          var payments = new PaymentCollection();
          payments.fetch({
            data: { userid: app.session.user.id },
            success: function() {
              var account = new AccountView({
                collection: payments
              });
              RootView.getInstance().setView(account);
            }
          });
        },
        error: function (res) {
          if (res.get('auth')) {
            var payments = new PaymentCollection();
            payments.fetch({
              data: { userid: app.session.user.id },
              success: function() {
                var account = new AccountView({
                  collection: payments
                });
                RootView.getInstance().setView(account);
              }
            });
          } else {
            self.navigate("/account/login", {
              trigger: true,
              replace: true
            });
          }
        }
      });
    },
    checkoutThankyou: function() {
      var cty = new CheckoutThankyouView({});
      RootView.getInstance().setView(cty);
    },
    checkoutError: function(token) {
      var cte = new CheckoutErrorView({token: token});
      RootView.getInstance().setView(cte);
    },
    checkout: function() {
      var self = this;
      app.session.checkAuth({
        success: function (res) {
          var checkout = new CheckoutView({collection: RootView.getInstance().navbar.collection});
          RootView.getInstance().setView(checkout);
        },
        error: function (res) {
          if (res.get('auth')) {
            var checkout = new CheckoutView({collection: RootView.getInstance().navbar.collection});
            RootView.getInstance().setView(checkout);
          } else {
            self.navigate("/account/login/checkout", {
              trigger: true
            });
          }
        }
      });
    },
    login: function () {
      var login = new LoginView({});
      RootView.getInstance().setView(login);
    },
    admin: function () {
      var self = this;
      app.session.checkAuth({
        success: function (res) {
          var admin = new AdminView({});
          RootView.getInstance().setView(admin);
        },
        error: function (res) {
          if (res.get('auth')) {
            self.navigate("/account", {
              trigger: true,
              replace: true
            });
          } else {
            self.navigate("/admin/login", {
              trigger: true,
              replace: true
            });
          }
        }
      });
    },
    info: function (id) {
      var model = new ProductModel({
        id: id
      });
      model.fetch({
        success: function () {
          var product = new ProductView({
            model: model
          });
          var view = new IndexView({
            content: product,
            cat: model.get('catid'),
            info: true
          });
          RootView.getInstance().setView(view);
        }
      });
    },
    showcat: function (id) {
      var products = new ProductCollection();
      products.fetch({
        data: {catid: id, offset: 0, count: 10},
        success: function() {
          var content = new ContentView({
            collection: products
          });
          var view = new IndexView({
            content: content,
            cat: id
          });
          RootView.getInstance().setView(view);

          $('#prev').hide();
          if (products.length != 10) {
            $('#next').hide();
          } else {
            $('#next').show();
          }
        }
      });
    },
    index: function () {
      var products = new ProductCollection();
      products.fetch({
        data: {offset: 0, count: 10},
        success: function() {
          var content = new ContentView({
            collection: products
          });
          var view = new IndexView({
            content: content
          });
          RootView.getInstance().setView(view);

          $('#prev').hide();
          if (products.length != 10) {
            $('#next').hide();
          } else {
            $('#next').show();
          }
        }
      });
    }
  });
});
