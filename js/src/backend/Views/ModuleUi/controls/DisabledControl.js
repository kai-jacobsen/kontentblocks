//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  className: 'ui-disabled kb-disabled block-menu-icon dashicons dashicons-dismiss',
  isValid: function () {
    if (this.model.get('settings').disabled) {
      return true;
    } else {
      return false;
    }
  }
});