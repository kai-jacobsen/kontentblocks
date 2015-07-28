//KB.Backbone.Common.FieldConfigsCollection
var FieldConfigModel = require('./FieldConfigModel');
module.exports = Backbone.Collection.extend({
  initialize: function () {
    this._byModule = {};
    this._linkedFields = [];
    this.listenTo(this, 'add', this.addToModules);
    this.listenTo(this, 'add', this.bindLinkedFields);
  },
  model: FieldConfigModel,
  addToModules: function (model) {
    console.log('add');
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
  },
  bindLinkedFields: function(model){

    var lf = model.get('linkedFields');

    _.each(lf, function(val, fid){
      if (_.isNull(val)){
        var xModel = this.get(fid);
        if (xModel){
          lf[fid] = xModel;
          model.listenTo(xModel, 'external.change', model.externalUpdate);
          this.bindLinkedFields(xModel);
        }
      }
    },this);

  },
  //bindLinkedFields: function (model) {
  //  _.each(this.models, function (m) {
  //    var links = m.get('linkedFields') || {};
  //    var uid = model.get('uid');
  //    if (links.hasOwnProperty(uid) && _.isNull(links[uid])) {
  //      links[uid] = model;
  //      model.listenTo(m, 'external.change', model.externalUpdate);
  //    }
  //  });
  //
  //  var newLinks = model.get('linkedFields');
  //
  //  if (newLinks) {
  //    _.each(newLinks, function (newLink, i) {
  //      if ( this.get(i)){
  //        var m2 = this.get(i);
  //        newLinks[i] = m2;
  //      }
  //    }, this);
  //  }
  //},
  updateModels: function (data) {
    if (data) {
      _.each(data, function (field) {
        var model = this.get(field.uid);
        if (model) {
          model.trigger('field.model.settings', field);
        } else {
          this.add(field);
        }
      }, this);
    }
  }
});