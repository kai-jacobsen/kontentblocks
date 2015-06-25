var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = BaseView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.listenTo(this.model, 'change:settings', this.render);
  },
  className: 'dashicons dashicons-visibility kb-area-status-action',
  events: {
    'click': 'changeStatus'
  },
  render: function () {
    var settings = this.model.get('settings');
    this.$el.removeClass('kb-area-status-inactive');
    if (!settings.active) {
      this.$el.addClass('kb-area-status-inactive');
    }
  },
  changeStatus: function () {
    alert('click');
  },
  isValid: function () {
    return true;
  },
  success: function () {

  }
});