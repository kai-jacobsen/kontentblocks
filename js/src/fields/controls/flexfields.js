var BaseView = require('../FieldBaseView');
var FlexfieldController = require('fields/controls/flexfields/FlexfieldsController');
KB.Fields.registerObject('flexfields', BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    this.$stage = this.$('.flexible-fields--stage');
    this.createController();
  },
  derender: function () {
    this.FlexFieldsController.dispose();
  },
  rerender: function () {
    this.derender();
    this.render();
  },
  createController: function () {
    if (!this.FlexFieldsController) {
      return this.FlexFieldsController = new FlexfieldController({
        el: this.$stage.get(0),
        model: this.model,
        parentView: this
      })
    }
    this.FlexFieldsController.setElement(this.$stage.get(0)); // root element equals stage element
    return this.FlexFieldsController.render(); // init
  }
}));