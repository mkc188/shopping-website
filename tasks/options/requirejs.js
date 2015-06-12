var grunt = require('grunt');

module.exports = {
  production: {
    options: {
      baseUrl: 'tmp',
      // mainConfigFile: 'tmp/main.build.js', // wont work :/ see TODO: remove build duplication
      name: '../bower_components/almond/almond',
      include: ['main'],
      exclude: ['coffee-script'],
      stubModules: ['cs'],
      out: 'dist/js/main.js',
      removeCombined: true,
      findNestedDependencies: true,
      optimize: 'uglify2',
      paths: {
        'jquery': '../bower_components/jquery/jquery',
        'underscore': '../bower_components/underscore/underscore',
        'handlebars': '../bower_components/handlebars/handlebars',
        'backbone': '../bower_components/backbone/backbone',
        'thorax': '../bower_components/thorax/thorax',
        'coffee-script': '../bower_components/coffee-script/index',
        'cs': '../bower_components/require-cs/cs',
        'text': '../bower_components/text/text',
        'hbs': '../bower_components/requirejs-hbs/hbs',
        'localstorage': '../bower_components/backbone.localStorage/backbone.localstorage',
        'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap',
        'bootstrap-hover-dropdown': '../bower_components/bootstrap-hover-dropdown/bootstrap-hover-dropdown',
        'jquery.ui.widget': '../bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget',
        'jquery.iframe-transport': '../bower_components/blueimp-file-upload/js/jquery.iframe-transport',
        'jquery.fileupload': '../bower_components/blueimp-file-upload/js/jquery.fileupload',
        'canvas-to-blob': '../bower_components/blueimp-canvas-to-blob/js/canvas-to-blob',
        'load-image': '../bower_components/blueimp-load-image/js/load-image',
        'load-image-exif': '../bower_components/blueimp-load-image/js/load-image-exif',
        'load-image-ios': '../bower_components/blueimp-load-image/js/load-image-ios',
        'load-image-meta': '../bower_components/blueimp-load-image/js/load-image-meta',
        'load-image-orientation': '../bower_components/blueimp-load-image/js/load-image-orientation',
        'tmpl': '../bower_components/blueimp-tmpl/js/tmpl',
        'ekko-lightbox': '../bower_components/ekko-lightbox/dist/ekko-lightbox',
        'bootstrap-touchspin': '../bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin',
        'secure-handlebars-helpers': '../bower_components/secure-handlebars-helpers/dist/secure-handlebars-helpers.min'
      },
      shim: {
        'handlebars': {
          exports: 'Handlebars'
        },
        'backbone': {
          exports: 'Backbone',
          deps: ['jquery', 'underscore']
        },
        'underscore': {
          exports: '_'
        },
        'thorax': {
          exports: 'Thorax',
          deps: ['handlebars', 'backbone']
        },
        'localstorage': {
          deps: ['backbone']
        },
        'bootstrap': {
          deps: ['jquery']
        },
        'bootstrap-hover-dropdown': {
          deps: ['jquery', 'bootstrap']
        },
        'ekko-lightbox': {
          deps: ['bootstrap']
        },
        'bootstrap-touchspin': {
          deps: ['bootstrap']
        },
        'secure-handlebars-helpers': {
          deps: ['handlebars']
        }
      }
    }
  }
};
