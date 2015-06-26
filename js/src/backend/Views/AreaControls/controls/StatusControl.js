var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
    this.listenTo(this.model, 'change:settings', this.render);
  },
  attributes: {
      "data-tipsy" : 'Switch area visibility on/off'
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
    Ajax.send({
      action: 'syncAreaSettings',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: this.model.get('settings')
    }, this.success, this);
  },
  isValid: function () {
    return true;
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data);
      Notice.notice('Area status updated', 'success');
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});