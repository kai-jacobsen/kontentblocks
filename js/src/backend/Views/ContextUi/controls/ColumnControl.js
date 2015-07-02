//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Controller = options.parent;
    this.ColumnView = options.ColumnView;
    this.ColumnView.Control = this;
  },
  className: 'context-visibility',
  events: {
    'click': 'switch'
  },
  render: function(){
    this.$el.append('<span class="kb-button-small">' + this.ColumnView.$el.data('kbcolname')  +'</span>');
  },
  isValid: function () {
    return true;
  },
  switch: function(){
    this.$el.toggleClass('kb-context-hidden');
    this.ColumnView.$el.toggle();
    this.ColumnView.isVisible = !this.ColumnView.isVisible;
    this.Controller.renderLayout();
  }
});