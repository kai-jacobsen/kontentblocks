var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  attributes: {
  },
  className: 'dashicons dashicons-visibility kb-area-status-action',
  events: {
    'click': 'changeStatus'
  },
  render: function () {
    var settings = this.model.get('settings');
    this.parent.$el.removeClass('kb-area-status-inactive');
    if (!settings.active) {
      this.parent.$el.addClass('kb-area-status-inactive');
    }
  },
  changeStatus: function () {

    var settings = this.model.get('settings');
    settings.active = !settings.active;

    Ajax.send({
      action: 'syncAreaSettings',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: settings
    }, this.success, this);
  },
  isValid: function () {
    if (KB.Environment && KB.Environment.postType === 'kb-dyar'){
      return false;
    }
    return true;
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data);
      this.render();
      Notice.notice('Area status updated', 'success');
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});