//KB.Backbone.PanelModel
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'baseId',
  attachedFields: {},
  changedFields: {},
  initialize: function(){
    this.type = 'panel';
  },
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'field.model.dirty', this.addChangedField);
    this.listenTo(FieldModel, 'field.model.clean', this.removeChangedField);
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function(FieldModel){
    if (this.attachedFields[FieldModel.id]){
      delete this.attachedFields[FieldModel.id];
    }
    if (this.changedFields[FieldModel.id]){
      delete this.changedFields[FieldModel.id];
    }
  },
  addChangedField: function (FieldModel) {
    this.changedFields[FieldModel.id] = FieldModel;
  },
  removeChangedField: function (FieldModel) {
    if (this.changedFields[FieldModel.id]) {
      delete this.changedFields[FieldModel.id];
    }

    if (_.isEmpty(this.changedFields)){
      this.trigger('module.model.updated');
    }

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