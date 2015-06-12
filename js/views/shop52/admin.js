define([
  'app',
  'view',
  'models/category',
  'views/shop52/admin-category',
  'collections/categories',
  'models/product',
  'views/shop52/admin-product',
  'collections/products',
  'views/shop52/changepw',
  'hbs!templates/shop52/admin'
], function (app, View, CategoryModel, AdminCategory, CategoryCollection, ProductModel, AdminProduct, ProductCollection, ChangepwView, template) {
  return View.extend({
    name: 'shop52/admin',
    template: template,
    model: new Thorax.Model({
      edit: false,
      delete: false,
      category: true
    }),
    options: {
      populate: false
    },
    events: {
      "click #logout-link": function (event) {
        event.preventDefault();
        app.session.logout({}, {
          success: function () {
            Backbone.history.navigate("/admin/login", {
              trigger: true,
              replace: true
            });
          }
        }); // No callbacks needed b/c of session event listening
      },
      "click #remove-account-link": function (event) {
        event.preventDefault();
        app.session.removeAccount({}, {
          success: function () {
            Backbone.history.navigate("/admin/login", {
              trigger: true,
              replace: true
            });
          }
        });
      },
      "click input[type=radio]": function (event) {
        // fix empty string error
        this.$('input[type="text"]').val('');
        this.$('input[type="file"]').val('');
        this.$('textarea').val('');
        this.model.set({
          photo: false
        });
        this.model.set({
          edit: this.$('#action_edit').is(':checked')
        });
        this.model.set({
          delete: this.$('#action_delete').is(':checked')
        });
        this.model.set({
          category: this.$('#type_categories').is(':checked')
        });
      },
      "submit form": function (event) {
        event.preventDefault();
        var attributes = this.serialize();
        this.model.set(attributes);
        if (this.model.get('formType') == 'categories') {
          switch (this.model.get('formAction')) {
          case 'new':
            category = new CategoryModel({
              name: this.model.get('name')
            });
            category.save();
            break;
          case 'edit':
            category = new CategoryModel({
              id: this.model.get('select'),
              name: this.model.get('name')
            });
            category.save();
            this.adminCategory.collection.set(category, {
              remove: false
            });
            break;
          case 'delete':
            category = new CategoryModel({
              id: this.model.get('select')
            });
            category.destroy();
            this.adminCategory.collection.remove(category);
            break;
          }
          this.$('input[type="text"]').val('');
        }
        if (this.model.get('formType') == 'products') {
          switch (this.model.get('formAction')) {
          case 'new':
            var that = this;
            $('#product-photo').fileupload({
              autoUpload: false
            });
            $('#product-photo').fileupload('add', {
              files: $('#product-photo')[0].files,
              url: '/upload'
            });
            $('#product-photo').fileupload('send', {
              files: $('#product-photo')[0].files
            }).success(function (result, textStatus, jqXHR) {
              product = new ProductModel({
                catid: that.model.get('select'),
                name: that.model.get('name'),
                price: that.model.get('price'),
                description: that.model.get('description'),
                photo: JSON.parse(result).files[0].url.split('?')[0]
              });
              product.save();
            });
            $('#product-photo').fileupload('destroy');
            break;
          case 'edit':
            var that = this;
            $('#product-photo').fileupload({
              autoUpload: false
            });
            $('#product-photo').fileupload('add', {
              files: $('#product-photo')[0].files,
              url: '/upload'
            });
            $('#product-photo').fileupload('send', {
              files: $('#product-photo')[0].files
            }).success(function (result, textStatus, jqXHR) {
              product = new ProductModel({
                id: that.model.get('select')[0],
                catid: that.model.get('select')[1],
                name: that.model.get('name'),
                price: that.model.get('price'),
                description: that.model.get('description'),
                photo: JSON.parse(result).files[0].url.split('?')[0]
              });
              product.save();
              that.adminProduct.collection.set(product, {
                remove: false
              });
            });
            $('#product-photo').fileupload('destroy');
            break;
          case 'delete':
            product = new ProductModel({
              id: this.model.get('select')
            });
            product.destroy();
            this.adminProduct.collection.remove(product);
            break;
          }
          this.$('input[type="text"]').val('');
          this.$('input[type="file"]').val('');
          this.$('textarea').val('');
          this.model.set({
            photo: false
          });
        }
      },
      'change input[type=radio]': function (event) {
        setTimeout(function() {
          $("#product-photo").change(function(){
            if (this.files && this.files[0]) {
              var reader = new FileReader();
              reader.onload = function (e) {
                $('#preview').attr('src', e.target.result);
              }
              reader.readAsDataURL(this.files[0]);
            }
          });
        }, 1000);
        var that = this;
        this.adminCategory = new AdminCategory();
        this.adminProduct = new AdminProduct();
        this.adminProduct.on('change #select-product', function (event) {
          selected = new ProductModel({
            id: this.$('#select-product').val()
          });
          selected.fetch({
            success: function () {
              $('#product-name').val(selected.get('name'));
              $('#product-price').val(selected.get('price'));
              $('#product-description').val(selected.get('description'));
              that.model.set({
                photo: selected.get('photo')
              });
              that.adminProduct.trigger('selectOption', selected.get('id'));
              that.adminCategory.trigger('selectOption', selected.get('catid'));
            }
          });

          // repeat myself to show preview in product edit
          setTimeout(function() {
            $("#product-photo").change(function(){
              if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                  $('#preview').attr('src', e.target.result);
                }
                reader.readAsDataURL(this.files[0]);
              }
            });
          }, 1000);
        });
      },
      ready: function () {
        $(document).scrollTop(0);
      }
    },
    initialize: function() {
      this.changepw = new ChangepwView();
    }
  });
});
