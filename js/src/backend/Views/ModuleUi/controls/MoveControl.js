//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var I18n = require('common/I18n');
module.exports = BaseView.extend({
  id: 'move',
  initialize: function (options) {
    this.options = options || {};
  },
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.tooltips.dragToSort')
  },
  className: 'ui-move kb-move block-menu-icon',
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)) {
      return false;
    }

    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks') && !this.model.get('submodule')) {
      return true;
    } else {
      return false;
    }
  }
});