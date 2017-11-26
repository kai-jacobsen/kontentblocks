var Ajax = require('common/Ajax');
var Config = require('common/Config');

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
    return this.$el.html('update');
  },
  update: function(){
    var view = this.controller.getCurrentView();
    Ajax.send({
      action: 'updateModuleViewTemplate',
      _ajax_nonce: Config.getNonce('update'),
      view: view.model.toJSON(),
      tplstring: this.controller.editor.getValue(),
      module: this.controller.moduleModel.toJSON()
    }, this.success, this);
  },
  success: function(res){
    console.log(res);
  }
});