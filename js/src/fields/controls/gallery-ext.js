var BaseView = require('fields/FieldControlBaseView');
var GalleryExtController = require('./gallery-ext/GalleryExtController');
module.exports = BaseView.extend({
  initialize: function () {
    this.selection = null;
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-gallery-ext__stage');
    this.createController();
    this.$stage.append(this.GalleryController.render());
  },
  derender: function () {
    if (this.GalleryController){
      this.GalleryController.$el.detach();
    }
  },
  createController: function () {
    if (!this.GalleryController) {
      this.GalleryController = new GalleryExtController({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    return this.GalleryController;

  }
});