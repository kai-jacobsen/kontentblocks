var BaseView = require('../FieldControlBaseView');
var DateMultipleController = require('fields/controls/date-multiple/DateMultipleController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('[data-kftype="date-multiple"]');
    this.DateMultipleController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.DateMultipleController.render();
    });
  },
  derender: function () {
    this.FlexFieldsController.derender();
  },
  rerender: function () {
    this.render();
  },
  createController: function () {
    if (!this.DateMultipleController) {
      return this.DateMultipleController = new DateMultipleController({
        el: this.$('[data-kftype="date-multiple"]'),
        model: this.model,
        parentView: this
      })
    }
  }
});