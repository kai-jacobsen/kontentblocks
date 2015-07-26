//KB.Backbone.PanelModel
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'baseId',
  initialize: function(){
    this.type = 'panel';
  },
  sync: function (save, context) {
    var that = this;
    KB.Events.trigger('panel.before.sync');
    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updatePostPanel',
        data: that.toJSON().moduleData,
        panel: that.toJSON(),
        editmode: (save) ? 'update' : 'preview',
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.set('moduleData', res.data.newModuleData);
        that.trigger('module.model.updated', that);
      },
      error: function () {
        Logger.Debug.error('sync | FrontendModal | Ajax error');
      }
    });
  }
});