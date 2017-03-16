var BaseView = require('../FieldControlBaseView');
var FlexfieldController = require('fields/controls/flexfields/FlexfieldsController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    var that = this;
    this.$stage = this.$('.flexible-fields--stage');
    this.FlexFieldsController.setElement(this.$stage.get(0)); // root element equals stage element
    _.defer(function(){
      that.FlexFieldsController.render();
    });
  },
  derender: function () {
    this.FlexFieldsController.derender(); 
  },
  rerender: function () {
    this.FlexFieldsController.derender();
    this.render();
  },
  createController: function () {
    if (!this.FlexFieldsController) {
      return this.FlexFieldsController = new FlexfieldController({
        el: this.$('.flexible-fields2--stage'),
        model: this.model,
        parentView: this
      })
    }
  }
});