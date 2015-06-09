//KB.Backbone.Common.FieldConfigsCollection
var FieldConfigModel = require('./FieldConfigModel');
module.exports = Backbone.Collection.extend({
  initialize: function () {
    this._byModule = {};
    this.listenTo(this, 'add', this.addToModules);
  },
  model: FieldConfigModel,
  addToModules: function (model) {
    if (model.ModuleModel) {
      var cid = model.ModuleModel.id;
      if (!this._byModule[cid]) {
        this._byModule[cid] = {};
      }
      this._byModule[cid][model.id] = model;
    }
  },
  getFieldsforModule: function (id) {
    if (this._byModule[id]) {
      return this._byModule[id];
    }
    return {};
  }
});