var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Controller = options.parent;
  },
  className: 'context-reset-layout',
  events: {
    'click': 'resetLayout'
  },
  render: function(){
      this.$el.append('<span class="kb-button-small">Reset</span>');
  },
  isValid: function () {
    return true;
  },
  resetLayout: function(){
    this.Controller.resetLayout();
  }
});