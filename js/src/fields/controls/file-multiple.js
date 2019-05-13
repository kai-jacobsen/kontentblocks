var BaseView = require('../FieldControlBaseView');
var FileMultipleController = require('fields/controls/file-multiple/FileMultipleController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('[data-kftype="file-multiple"]');
    this.FileMultipleController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.FileMultipleController.render();
    });
  },
  derender: function () {
    this.FileMultipleController.derender();
  },
  rerender: function () {
    this.render();
  },
  createController: function () {
    if (!this.FileMultipleController) {
      return this.FileMultipleController = new FileMultipleController({
        el: this.$('[data-kftype="file-multiple"]'),
        model: this.model,
        parentView: this
      })
    }
  }
});