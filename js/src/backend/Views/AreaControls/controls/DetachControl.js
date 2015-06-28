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
    "data-tipsy": 'Detach area from this post'
  },
  className: 'dashicons dashicons-no-alt',
  events: {
    'click': 'detach'
  },
  detach: function () {

    var settings = _.clone(this.model.get('settings'));
    settings.attached = !settings.attached;

    Ajax.send({
      action: 'syncAreaSettings',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: settings
    }, this.success, this);
  },
  isValid: function () {
    return this.model.get('dynamic');
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data);
      Notice.notice('Area status updated', 'success');
      jQuery('.tipsy').remove();
      this.parent.$el.remove();
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});