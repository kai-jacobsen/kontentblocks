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
    return this.$el.html('<span class="dashicons dashicons-trash"></span> Delete loaded template');
  },
  ask: function () {
    Notice.confirm('Template Name', 'Delete template?', function (evt, value) {
        this.delete();
      },
      function (evt, value) {
      }, this);
  },
  delete: function () {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'deleteModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      module: this.controller.moduleModel.toJSON(),
      view: view.model.toJSON()
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error', 8);
      this.controller.trigger('broadcast', res.message);
      return
    }
    this.controller.List.updateViews(res.data.views);
    this.controller.trigger('broadcast', res.message);

  }
});