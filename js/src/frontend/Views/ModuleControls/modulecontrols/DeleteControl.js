//KB.Backbone.Frontend.ModuleDelete
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');


module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-trash"></span><span class="os-action">' + KB.i18n.jsFrontend.moduleControls.controlsDelete + '</span>');
  },
  className: 'kb-module-inline-delete kb-nbt kb-nbb kb-js-inline-delete',
  events: {
    'click': 'confirmRemoval'
  },
  confirmRemoval: function () {
    Notice.confirm('Remove', KB.i18n.EditScreen.notices.confirmDeleteMsg, this.removeModule, this.cancelRemoval, this);
  },
  removeModule: function () {
    var that = this;
    Ajax.send({
      action: 'removeModules',
      _ajax_nonce: Config.getNonce('delete'),
      module: that.model.get('mid'),
      postId: that.model.get('post_id')
    }, this.afterRemoval, this);
  },
  afterRemoval: function () {
    this.Parent.$el.parent('.kb-wrap').remove();
    this.trigger('remove');
    // removes the model from model collection
    // removal triggers remove on views collection
    // views collection triggers kb.module.view.deleted
    KB.Modules.remove(this.model);
  },
  cancelRemoval: function () {
    return false;
  },
  isValid: function () {
    return Check.userCan('delete_kontentblocks');
  }
});