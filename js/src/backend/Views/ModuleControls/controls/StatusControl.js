//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var I18n = require('common/I18n');
module.exports = BaseView.extend({
  id: function () {
    return 'status_' + this.model.get('id');
  },
  initialize: function (options) {
    this.options = options || {};
  },
  className: 'module-status block-menu-icon',
  events: {
    'click': 'changeStatus',
    'keydown':'keyDown'
  },
  keyDown: function(e){
    if (e.keyCode === 13){
      this.$el.trigger('click')
    }
  },
  attributes: function () {
    if (this.model.get('state').active) {
      return {
        'data-kbtooltip': I18n.getString('Modules.controls.be.tooltips.status.off'),
        'aria-label': I18n.getString('Modules.controls.be.tooltips.status.off'),
        'tabindex': "0",
        'role': 'button'
      }
    } else {
      return {
        'data-kbtooltip': I18n.getString('Modules.controls.be.tooltips.status.on'),
        'aria-label': I18n.getString('Modules.controls.be.tooltips.status.on'),
        'tabindex': "0",
        'role': 'button'
      }
    }
  },
  changeStatus: function () {
    Ajax.send({
      action: 'changeModuleStatus',
      module: this.model.get('mid'),
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);

  },
  isValid: function () {
    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }

    if (!this.model.get('disabled') &&
      Checks.userCan('deactivate_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  success: function () {
    var state = this.model.get('state');
    state.active = !state.active;
    this.model.set('state', state);
    if (state.active) {
      this.$el.attr('data-kbtooltip', I18n.getString('Modules.controls.be.tooltips.status.off'));
      this.$el.attr('aria-label', I18n.getString('Modules.controls.be.tooltips.status.off'));
    } else {
      this.$el.attr('data-kbtooltip', I18n.getString('Modules.controls.be.tooltips.status.on'));
      this.$el.attr('aria-label', I18n.getString('Modules.controls.be.tooltips.status.on'));
    }

    this.options.parent.$head.toggleClass('module-inactive');
    this.options.parent.$el.toggleClass('activated deactivated');
    Notice.notice('Status changed', 'success');
  }
});