var BaseView = require('fields/FieldBaseView');
var Gallery2Controller = require('./gallery2/Gallery2Controller');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
    this.selection = null;
  },
  render: function () {
    this.$stage = this.$('.kb-gallery2__stage');
    this.createController();
  },
  derender: function () {
    this.GalleryController.dispose();
  },
  rerender: function () {
    this.derender();
    this.render();
  },
  createController: function () {

    if (!this.GalleryController) {
      this.GalleryController = new Gallery2Controller({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    this.GalleryController.setElement(this.$stage.get(0));
    return this.GalleryController.render();

  }
});