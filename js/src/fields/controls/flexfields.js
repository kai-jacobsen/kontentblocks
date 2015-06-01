var BaseView = require('../FieldBaseView');
var Templates = require('common/Templates');
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
      return this.FlexFieldsController = new KB.FlexibleFields.Controller({
        el: this.$stage.get(0),
        model: this.model
      })
    }
    this.FlexFieldsController.setElement(this.$stage.get(0));
    return this.FlexFieldsController.render();
  }
}));