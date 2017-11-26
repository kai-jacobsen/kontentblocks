var BaseView = require('../FieldControlBaseView');
var SubareaConroller = require('fields/controls/subarea/SubareaController');
module.exports = BaseView.extend({
  initialize: function () {
    this.createController();
    this.render();
  },
  render: function () {
    this.$stage = this.$('.kb-field--subarea-stage');
    this.SubareaConroller.setElement(this.$stage.get(0)); // root element equals stage element
    this.SubareaConroller.render();
  },
  derender: function () {
    this.SubareaConroller.derender();
  },
  rerender: function () {
    this.SubareaConroller.derender();
    this.model.setData();
    this.render();
  },
  createController: function () {
    var that = this;
    if (!this.SubareaConroller) {
      return this.SubareaConroller = new SubareaConroller({
        el: this.$('.kb-field--subarea-stage'),
        model: this.model,
        parentView: this,
        subarea: KB.Areas.get(that.$('.kb-field--subarea-stage').attr('id')),
        area: this.model.ModuleModel.Area
      })
    }
  }
});