//KB.Backbone.Common.FieldConfigModelModal
var FieldConfigModel = require('./FieldConfigModel');
module.exports = FieldConfigModel.extend({
  initialize: function () {
    FieldConfigModel.prototype.initialize.call(this, arguments);

  },
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove);
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData);
    this.listenTo(KB.Events, 'modal.reload', this.rebind);
    this.listenTo(KB.Events, 'modal.close', this.remove);
  },
  rebind: function () {
    if (this.FieldView) {
      this.FieldView.setElement(this.getElement());
      this.FieldView.rerender();
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]', KB.EditModalModules.$el)[0];
  }
});