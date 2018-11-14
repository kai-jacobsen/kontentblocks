//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var TinyMCE = require('common/TinyMCE');
var Window = require('common/Window');
var BatchDeleteController = require('shared/BatchDelete/BatchDeleteController');
var I18n = require('common/I18n');

module.exports = BaseView.extend({
  id: function () {
    return 'delete_' + this.model.get('id');
  },
  marked: false,
  className: 'kb-delete block-menu-icon',
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.controls.be.tooltips.delete'),
    "tabindex": "0",
    "role" : "button",
    "aria-label": I18n.getString('Modules.controls.be.tooltips.delete')
  },
  initialize: function () {
    _.bindAll(this, "yes", "no");
  },
  events: {
    'click': 'deleteModule',
    'keydown': 'keyDown'
  },
  keyDown: function(e){
    if (e.keyCode === 13){
      this.$el.trigger('click')
    }
  },
  deleteModule: function () {
    if (Window.ctrlPressed()) {
      if (!this.marked) {
        BatchDeleteController.add(this);
        this.mark();
      } else {
        BatchDeleteController.remove(this);
        this.unmark();
      }
    } else {
      Notice.confirm('Delete Module?', KB.i18n.EditScreen.notices.confirmDeleteMsg, this.yes, this.no, this);
    }

  },
  mark: function () {
    this.$el.addClass('kb-batch-marked');
    this.marked = true;
  },
  unmark: function () {
    this.$el.removeClass('kb-batch-marked');
    this.marked = false;
  },
  isValid: function () {
    return !!(!this.model.get('predefined') && !this.model.get('disabled') && !this.model.get('submodule') &&
      Checks.userCan('delete_kontentblocks'));
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
    if (res.success) {
      TinyMCE.removeEditors(this.model.View.$el);
      KB.ObjectProxy.removeModel(this.model);
      KB.Modules.remove(this.model);

      wp.heartbeat.interval('fast', 2);
      // this.model.destroy();
    } else {
      Notice.notice('Error while removing a module', 'error');
    }

  }
});