//KB.Backbone.ModuleModel
var Config = require('common/Config');
var Notice = require('common/Notice');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  initialize: function () {
    this.subscribeToArea();
  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel) {
      AreaModel = KB.Areas.get(this.get('area'));
    }
    AreaModel.View.attachModuleView(this);
    this.Area = AreaModel;
  },
  dispose: function () {
    this.stopListening()
  },
  sync: function (save, context) {
    var that = this;
    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateModule',
        data: that.toJSON().moduleData,
        module: that.toJSON(),
        editmode: (save) ? 'update' : 'preview',
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.set('moduleData', res.data.newModuleData);
      },
      error: function () {
        Logger.Debug.error('serialize | FrontendModal | Ajax error');
      }
    });
  }

});