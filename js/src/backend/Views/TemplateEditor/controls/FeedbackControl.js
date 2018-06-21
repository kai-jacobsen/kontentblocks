var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls;
    this.listenTo(this.controller, 'broadcast', this.setMessage)
  },
  events: {
    'click': 'update'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-warning"></span><div class="kb-tpled--notice" data-message></div>');
  },
  setMessage: function (msg) {
    var $msg = this.$('[data-message]');
    $msg.html(msg);

  }
});