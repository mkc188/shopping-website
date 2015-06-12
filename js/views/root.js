define([
  'layout-view',
  'views/shop52/navbar',
  'collections/cart-items',
  'hbs!templates/root'
], function(LayoutView, Navbar, CartItemCollections, rootTemplate) {
  var RootView = LayoutView.extend({
    name: 'root',
    template: rootTemplate,
    events: {
      ready: function() {
        $('[data-hover="dropdown"]').dropdownHover(hoverDelay = 1000);
        $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
          event.preventDefault();
          $(this).ekkoLightbox();
        });
      }
    },
    initialize: function() {
      var cartItems = new CartItemCollections();
      this.navbar = new Navbar({
        collection: cartItems
      });
    }
  });

  var instance;
  RootView.getInstance = function(target) {
    if (!instance) {
      instance = new RootView();
      instance.appendTo(target || document.body);
    }
    return instance;
  };

  return RootView;
});
