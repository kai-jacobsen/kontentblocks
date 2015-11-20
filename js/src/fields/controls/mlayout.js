var BaseView = require('../FieldControlBaseView');
var MLayoutController = require('fields/controls/mlayout/MLayoutController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    console.log('render');
    this.$stage = this.$('.kb-field--mlayout-stage');
    this.MLayoutController.setElement(this.$stage.get(0)); // root element equals stage element
    this.MLayoutController.render();
  },
  derender: function () {
    this.MLayoutController.derender();
  },
  rerender: function () {
    console.log('rerender');
    this.render();

  },
  createController: function () {
    if (!this.MLayoutController) {
      return this.MLayoutController = new MLayoutController({
        el: this.$('.kb-field--mlayout-stage'),
        model: this.model,
        parentView: this,
        area: this.model.ModuleModel.Area
      })
    }
  }
});