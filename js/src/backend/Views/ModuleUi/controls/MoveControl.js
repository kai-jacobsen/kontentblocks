//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
module.exports = BaseView.extend({
  id: 'move',
  initialize: function (options) {
    this.options = options || {};
  },
  attributes: {
    "data-kbtooltip": 'move to sort'
  },
  className: 'ui-move kb-move block-menu-icon',
  isValid: function () {
    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks') && !this.model.get('submodule')) {
      return true;
    } else {
      return false;
    }
  }
});