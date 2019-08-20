//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var FullscreenView = require('backend/Views/FullscreenView');
var Checks = require('common/Checks');
var I18n = require('common/I18n');

module.exports = BaseView.extend({
  id: 'fullscreen',
  initialize: function (options) {
    this.options = options || {};
    this.$parent = this.model.View.$el;
    this.$body = jQuery('.kb-module__body', this.$parent);
  },
  attributes: {
    "data-kbtooltip": I18n.getString('Modules.tooltips.toggleFullscreen')
  },
  events: {
    'click': 'openFullscreen'
  },
  className: 'ui-fullscreen kb-fullscreen block-menu-icon',
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)) {
      return false;
    }

    if (!this.model.get('settings').disabled &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  openFullscreen: function () {
    var that = this;
    if (!this.FullscreenView) {
      this.FullscreenView = new FullscreenView({
        model: this.model
      }).open();
    }
  },
  getFullscreenView: function () {
    if (!this.FullscreenView) {
      this.FullscreenView = new FullscreenView({
        model: this.model
      });
    }
    return this.FullscreenView;
  }
});