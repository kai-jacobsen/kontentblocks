var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = Backbone.Model.extend({
  idAttribute: 'mid',
  attachedFields: {},
  initialize: function () {
    this.type = 'module';
    this.listenTo(this, 'change:area', this.areaChanged);
    this.subscribeToArea();
  },
  destroy: function () {
    this.unsubscribeFromArea();
    this.stopListening(); // remove all listeners
  },
  attachField: function (FieldModel) {
    this.attachedFields[FieldModel.id] = FieldModel;
    this.listenTo(FieldModel, 'remove', this.removeAttachedField);
  },
  removeAttachedField: function (FieldModel) {
    if (this.attachedFields[FieldModel.id]) {
      delete this.attachedFields[FieldModel.id];
    }
  },
  connectView: function (ModuleView) {
    this.View = ModuleView;
    this.trigger('module.model.view.connected', ModuleView);
  },
  setArea: function (area) {
    this.setEnvVar('area', area.get('id'));
    this.setEnvVar('areaContext', area.get('context'));
    this.set('areaContext', area.get('context'));
    this.set('area', area.get('id'));
    this.Area = area;
    this.subscribeToArea(area);
  },
  areaChanged: function () {
    // @see backend::views:ModuleView.js
    this.View.updateModuleForm();
  },
  subscribeToArea: function (AreaModel) {
    if (!AreaModel) {
      AreaModel = KB.Areas.get(this.get('area'));
    }
    if (AreaModel) {
      AreaModel.View.attachModule(this);
      this.Area = AreaModel;
    }
  },
  unsubscribeFromArea: function () {
    this.Area.View.removeModule(this);
  },
  setEnvVar: function (attr, value) {
    var ev = _.clone(this.get('envVars'));
    ev[attr] = value;
    this.set('envVars', ev);
  },
  sync: function () {
    Ajax.send({
      action: 'updateModuleData',
      module: this.toJSON(),
      data: this.View.serialize(),
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);
  },
  success: function (res) {
    if (!res || !res.data.newModuleData) {
      _K.error('Failed to save module data.');
    }
    this.set('entityData', res.data.newModuleData, {silent:true});
    this.trigger('module.model.updated', this);
    Notice.notice('Data saved', 'success');
  }
});