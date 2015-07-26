//KB.Backbone.Common.FieldConfigModel
var Checks = require('common/Checks');
var Utilities = require('common/Utilities');
var Payload = require('common/Payload');
module.exports = Backbone.Model.extend({
  idAttribute: "uid",
  initialize: function () {
    this.cleanUp();
    var module = this.get('fieldId'); // fieldId equals baseId equals the parent object id (Panel or Module)
    if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) { // if object exists and this field type is valid
      this.set('ModuleModel', this.ModuleModel); // assign the parent object model
      this.setData(); // get data from the parent object and assign to this
      this.bindHandlers(); // attach listeners
      this.setupType(); // create the field view
    }
  },
  cleanUp: function () {
    var links = this.get('linkedFields') || {};
    if (links.hasOwnProperty(this.get('uid'))) {
      delete links[this.get('uid')];
    }
  },
  bindHandlers: function () {
    this.listenToOnce(this.ModuleModel, 'remove', this.remove); // delete this from collection when parent obj leaves
    this.listenTo(this.ModuleModel, 'change:moduleData', this.setData); // reassign data when parent obj data changes
    this.listenTo(this.ModuleModel, 'module.model.updated', this.getClean); // set state to clean
    this.listenTo(this, 'change:value', this.upstreamData); // assign new data to parent obj when this data changes
    this.listenTo(this.ModuleModel, 'modal.serialize.before', this.unbind); // before the frontend modal reloads the parent obj
    this.listenTo(this.ModuleModel, 'modal.serialize', this.rebind); // frontend modal reloaded parent obj, reattach handlers
    this.listenTo(this.ModuleModel, 'change:area', this.unbind); // parent obj was dragged to new area, detach handlers
    this.listenTo(this.ModuleModel, 'after.change.area', this.rebind); // parent obj was dragged to new area, reattach handlers
  },
  setupType: function () {
    if (obj = this.getType()) { // obj equals specific field view
      this.FieldView = new obj({ // create new field view if it does not exist
        el: this.getElement(), // get the root DOM element for this field
        model: this
      });
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0]; // root DOM element by data attribute
  },
  getType: function () {
    var type = this.get('type'); // link, image, etc

    //if (this.ModuleModel) {
    //  if (this.ModuleModel.type === 'panel' && type === 'EditableImage') {
    //    return false;
    //  }
    //
    //  if (this.ModuleModel.type === 'panel' && type === 'EditableText') {
    //    return false;
    //  }
    //}


    if (!Checks.userCan('edit_kontentblocks')) {
      return false;
    }

    // get the view object from KB.Fields collection
    var obj = KB.Fields.get(type);
    if (obj && obj.prototype.hasOwnProperty('initialize')) {
      return obj;
    } else {
      return false;
    }
  },
  getClean: function(){
      this.trigger('field.model.clean');
  },
  setData: function (Model) {
    var ModuleModel, fieldData, typeData, obj, addData = {}, mData;
    ModuleModel = Model || this.get('ModuleModel');
    fieldData = Payload.getPayload('fieldData');

    // special field data may come from the server
    if (fieldData[this.get('type')]) {
      typeData = fieldData[this.get('type')];
      if (typeData[this.get('fieldId')]) {
        obj = typeData[this.get('fieldId')];
        addData = Utilities.getIndex(obj, this.get('kpath'));
      }
    }
    // the parent obj data
    mData = Utilities.getIndex(ModuleModel.get('moduleData'), this.get('kpath'));
    this.set('value', _.extend(mData, addData)); // set merged data to this.value
  },
  // this is an option and is currently not used for something critical
  // demo implementation in textarea.js
  // since this data is only the data of a specific field we can upstream this data to the whole module data
  upstreamData: function () {
    if (this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('moduleData'));
      Utilities.setIndex(cdata, this.get('kpath'), this.get('value'));
      this.get('ModuleModel').set('moduleData', cdata, {silent: true});
      this.get('ModuleModel').View.getDirty();
    }
  },
  externalUpdate: function (model) {
    this.FieldView.synchronize(model);
  },
  remove: function () {
    this.stopListening();
    KB.FieldConfigs.remove(this);
  },
  rebind: function () {
    if (this.FieldView) {
      this.FieldView.setElement(this.getElement()); // markup might have changed, reset the root element
      this.FieldView.rerender(); // call rerender on the field
    }
  },
  unbind: function () {
    if (this.FieldView && this.FieldView.derender) {
      this.FieldView.derender(); // call derender
    }
  }
});