require([
  'app',
  'models/session',
  'jquery',
  'backbone',
  'views/root',
  'routers/shop52',
  'bootstrap',
  'bootstrap-hover-dropdown',
  'tmpl',
  'load-image',
  'canvas-to-blob',
  'jquery.ui.widget',
  'jquery.fileupload',
  'jquery.iframe-transport',
  'ekko-lightbox',
  'bootstrap-touchspin',
  'localstorage',
  'secure-handlebars-helpers',
  'helpers'
], function (app, SessionModel, $, Backbone, RootView, Shop52Router) {
  $(function () {
    // Just use GET and POST to support all browsers
    Backbone.emulateHTTP = true;

    // Initialize your routers here
    new Shop52Router();

    // Create a new session model and scope it to the app global
    // This will be a singleton, which other modules can access
    app.session = new SessionModel({});

    Backbone.history.start({
      pushState: false,
      root: '/',
      silent: true
    });

    // RootView may use link or url helpers which
    // depend on Backbone history being setup
    // so need to wait to loadUrl() (which will)
    // actually execute the route
    RootView.getInstance(document.body);

    // This will trigger your routers to start
    Backbone.history.loadUrl();
  });
});
