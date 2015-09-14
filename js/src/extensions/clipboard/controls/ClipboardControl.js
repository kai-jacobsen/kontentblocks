//KB.Backbone.Backend.ModuleStatus
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var I18n = require('common/I18n');
var Utilities = require('common/Utilities');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.ClipboardController = options.parent;
    var pid = this.model.get('postId');
    this.hash = Utilities.hashString(pid.toString() + this.model.get('mid'));
    this.model.clipboardHash = this.hash;
    this.statusClass();
  },
  className: 'module-clipboard block-menu-icon',
  events: {
    'click': 'toggleClipboard'
  },
  toggleClipboard: function () {
    if (!this.ClipboardController.entryExists(this.hash)) {
      var json = this.model.toJSON();
      json.hash = this.hash;
      this.ClipboardController.add(json);
    } else {
      this.ClipboardController.remove(this.hash);
    }
    this.statusClass();

  },
  isValid: function () {
    if (!this.model.get('disabled') &&
      Checks.userCan('deactivate_kontentblocks') && (this.model.get('globalModule') !== true)) {
      return true;
    } else {
      return false;
    }
  },
  success: function () {
  },
  statusClass: function () {
    if (this.ClipboardController.entryExists(this.hash)) {
      this.$el.addClass('kb-in-clipboard');
      this.$el.attr('data-kbtooltip', 'Huhuh');
    } else {
      this.$el.removeClass('kb-in-clipboard');
      this.$el.attr('data-kbtooltip', 'Hihihi');

    }
  }
});