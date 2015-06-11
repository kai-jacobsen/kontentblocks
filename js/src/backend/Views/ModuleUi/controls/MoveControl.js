//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  className: 'ui-move kb-move block-menu-icon',
  isValid: function () {
    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  }
});