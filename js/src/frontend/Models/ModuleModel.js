//KB.Backbone.ModuleModel
var Config = require('common/Config');
var Notice = require('common/Notice');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  attachedFields: {},
  changedFields: {},
  linkedModules: {},
  initialize: function () {
    this.subscribeToArea();
    this.type = 'module';

    if (this.get('globalModule')) {
      this.linkModules();
    }
  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel) {
      AreaModel = KB.Areas.get(this.get('area'));
    }
    AreaModel.View.attachModuleView(this);
    this.Area = AreaModel;
  },
  dispose: function () {
    this.stopListening();
  },
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'field.model.dirty', this.addChangedField);
    this.listenTo(FieldModel, 'field.model.clean', this.removeChangedField);
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function (FieldModel) {
    if (this.attachedFields[FieldModel.id]) {
      this.stopListening(FieldModel);
      delete this.attachedFields[FieldModel.id];
    }
    if (this.changedFields[FieldModel.id]) {
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

    if (_.isEmpty(this.changedFields)) {
      this.trigger('module.model.clean', this);
    }
  },
  sync: function (save, context) {
    var that = this;
    KB.Events.trigger('module.before.sync', this);
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
        if (save) {
           that.trigger('module.model.updated', that);
        }
      },
      error: function () {
        Logger.Debug.error('serialize | FrontendModal | Ajax error');
      }
    });
  },
  getModuleView: function () {
    if (this.View) {
      return this.View;
    }

    return false;
  },
  linkModules: function () {
    //var equals = KB.Modules.filterByAttr('parentObjectId', this.get('parentObjectId'));
    //_.each(equals, function (ModuleModel) {
    //  ModuleModel.linkedModules[this.cid] = this;
    //  this.linkedModules[ModuleModel.cid] = ModuleModel;
    //}, this);
    console.log('lingage');
  }

});