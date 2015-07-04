//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');

module.exports = BaseView.extend({
  className: 'kb-delete block-menu-icon',
  initialize: function () {
    _.bindAll(this, "yes", "no");
  },
  events: {
    'click': 'deleteModule'
  },
  deleteModule: function () {
    Notice.confirm('',KB.i18n.EditScreen.notices.confirmDeleteMsg, this.yes, this.no, this);
  },
  isValid: function () {
    if (!this.model.get('predefined') && !this.model.get('disabled') &&
      Checks.userCan('delete_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  yes: function () {
    Ajax.send({
      action: 'removeModules',
      _ajax_nonce: Config.getNonce('delete'),
      module: this.model.get('mid')
    }, this.success, this);
  },
  no: function () {
    return false;
  },
  success: function (res) {
    if (res.success){
      KB.Modules.remove(this.model);
      wp.heartbeat.interval('fast', 2);
      this.model.destroy();
    } else{
      Notice.notice('Error while removing a module', 'error');
    }

  }
});