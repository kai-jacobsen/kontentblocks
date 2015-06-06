//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  className: 'module-status block-menu-icon',
  events: {
    'click': 'changeStatus'
  },
  changeStatus: function () {

    Ajax.send({
      action: 'changeModuleStatus',
      module: this.model.get('instance_id'),
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);

  },
  isValid: function () {
    if (!this.model.get('disabled') &&
      Checks.userCan('deactivate_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  success: function () {
    this.options.parent.$head.toggleClass('module-inactive');
    this.options.parent.$el.toggleClass('activated deactivated');
    Notice.notice('Status changed', 'success');
  }
});