var BaseView = require('../FieldControlBaseView');
var TextMultipleController = require('fields/controls/text-multiple/TextMultipleController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('[data-kftype="text-multiple"]');
    this.TextMultipleController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.TextMultipleController.render();
    });
  },
  derender: function () {
    this.FlexFieldsController.derender();
  },
  rerender: function () {
    this.render();
  },
  createController: function () {
    if (!this.TextMultipleController) {
      return this.TextMultipleController = new TextMultipleController({
        el: this.$('[data-kftype="text-multiple"]'),
        model: this.model,
        parentView: this
      })
    }
  }
});