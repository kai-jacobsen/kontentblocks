var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'kb-tpled--notice',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls;
    this.listenTo(this.controller, 'broadcast', this.setMessage);
  },
  events: {
    'click': 'update'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-warning"></span><div class="" data-message></div>');
  },
  setMessage: function (msg) {
    var $msg = this.$('[data-message]');
    $msg.hide().html(msg).fadeIn(1500);
    setTimeout(function () {
      $msg.fadeOut(2000);
    }, 5000);
  }
});