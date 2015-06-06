//KB.Backbone.Backend.ModuleSave
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var UI = require('common/UI');
var Payload = require('common/Payload');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parentView = options.parent;

    this.listenTo(this.parentView, 'kb::module.input.changed', this.getDirty);
    this.listenTo(this.parentView, 'kb::module.data.updated', this.getClean);

  },
  className: 'kb-save block-menu-icon',
  events: {
    'click': 'saveData'
  },
  saveData: function () {

    tinyMCE.triggerSave();

    Ajax.send({
      action: 'updateModuleData',
      module: this.model.toJSON(),
      data: this.parentView.serialize(),
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);

  },
  getDirty: function () {
    this.$el.addClass('is-dirty');
  },
  getClean: function () {
    this.$el.removeClass('is-dirty');
  },
  isValid: function () {
    if (this.model.get('master')) {
      return false;
    }

    return !this.model.get('disabled') &&
      Checks.userCan('edit_kontentblocks');

  },
  success: function (res) {

    if (!res || !res.data.newModuleData) {
      _K.error('Failed to save module data.');
    }
    this.parentView.model.set('moduleData', res.data.newModuleData);
    Notice.notice('Data saved', 'success');
  }
});