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
    'click': 'update'
  },
  render: function () {
    return this.$el.html('<span class="dashicons dashicons-welcome-add-page"></span> Create new template');
  },
  update: function () {
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'updateModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      view: view.model.toJSON(),
      tplstring: this.controller.editor.getValue(),
      module: this.controller.moduleModel.toJSON()
    }, this.success, this);
  },
  success: function (res) {
    if (res.success === false) {
      Notice.notice(res.message, 'error',8);
    }
  }
});