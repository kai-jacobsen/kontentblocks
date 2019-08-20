//KB.Backbone.Backend.ModuleSave
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var UI = require('common/UI');
var Payload = require('common/Payload');
var I18n = require('common/I18n');
module.exports = BaseView.extend({
  id: 'save',
  initialize: function (options) {
    this.options = options || {};
    this.parentView = options.parent;
    this.listenTo(this.parentView, 'kb::module.input.changed', this.getDirty);
    this.listenTo(this.parentView, 'kb::module.data.updated', this.getClean);
    this.listenTo(this.model, 'change:entityData', this.getDirty);
  },
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.controls.be.tooltips.save')
  },
  className: 'kb-save block-menu-icon',
  events: {
    'click': 'saveData'
  },
  saveData: function () {
    tinyMCE.triggerSave();
    this.model.sync();
  },
  getDirty: function () {
    this.$el.addClass('is-dirty');
  },
  getClean: function () {
    this.$el.removeClass('is-dirty');
  },
  isValid: function () {
    if (!Checks.userCan(this.model.get('settings').cap)) {
      return false;
    }

    if (this.model.get('master')) {
      return false;
    }

    return !this.model.get('disabled') &&
      Checks.userCan('edit_kontentblocks');

  }
});