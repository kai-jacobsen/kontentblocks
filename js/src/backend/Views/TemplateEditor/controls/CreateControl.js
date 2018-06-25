var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');

module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.controls = options.controls
  },
  events: {
    'click': 'ask'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-welcome-add-page"></span> Create new template');
  },
  ask: function () {
    var tplName;
    Notice.prompt('Template Name', 'Please provide a unique template name', '.twig', function (evt, value) {
        tplName = value;
        this.create(tplName);
      },
      function (evt, value) {
      }, this);
  },
  create: function (tplName) {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'createModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      module: this.controller.moduleModel.toJSON(),
      tplstring: '',
      filename: tplName
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error', 8);
      return;
    }
    this.controller.List.updateViews(res.data.views);
    this.controller.trigger('broadcast', res.message);

  }
});