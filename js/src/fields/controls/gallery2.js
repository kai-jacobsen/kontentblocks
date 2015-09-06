var BaseView = require('fields/FieldControlBaseView');
var Gallery2Controller = require('./gallery2/Gallery2Controller');
module.exports = BaseView.extend({
  initialize: function () {
    this.selection = null;
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-gallery2__stage');
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
      this.GalleryController = new Gallery2Controller({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    return this.GalleryController;

  }
});