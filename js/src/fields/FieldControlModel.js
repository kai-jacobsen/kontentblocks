var Checks = require('common/Checks');
var Utilities = require('common/Utilities');
var Payload = require('common/Payload');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.Model.extend({
  idAttribute: "uid",
  initialize: function () {
    this.cleanUp(); //remove self from linked fields
    var module = this.get('fieldId'); // fieldId equals baseId equals the parent object id (Panel or Module)
    if (module && (this.ModuleModel = KB.ObjectProxy.get(module)) && this.getType()) { // if object exists and this field type is valid
      this.set('ModuleModel', this.ModuleModel); // assign the parent object model
      this.setData(); // get data from the parent object and assign to this
      this.bindHandlers(); // attach listeners
      this.setupType(); // create the field view
      this.ModuleModel.attachField(this);
    }
  },
  /*
   remove self from linked fields
   */
  cleanUp: function () {
    var links = this.get('linkedFields') || {};
    if (links.hasOwnProperty(this.get('uid'))) {
      delete links[this.get('uid')];
    }
  },
  bindHandlers: function () {
    this.listenTo(this, 'field.model.settings', this.updateLinkedFields);
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
    var view;
    if (view = this.getType()) { // obj equals specific field view
      this.FieldControlView = new view({ // create new field view
        el: this.getElement(), // get the root DOM element for this field
        model: this
      });
    }
  },
  updateLinkedFields: function (fieldSettings) {
    if (fieldSettings.linkedFields) {
      this.set('linkedFields', fieldSettings.linkedFields);
      this.cleanUp();
    }
  },
  getElement: function () {
    return jQuery('*[data-kbfuid="' + this.get('uid') + '"]')[0]; // root DOM element by data attribute
  },
  getType: function () {
    var type = this.get('type'); // link, image, etc
    if (!Checks.userCan('edit_kontentblocks')) {
      return false;
    }

    // get the view object from KB.Fields collection
    var control = KB.Fields.get(type);
    if (control && control.prototype.hasOwnProperty('initialize')) {
      return control;
    } else {
      return false;
    }
  },
  getClean: function () {
    this.trigger('field.model.clean', this);
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
  // since this data is only the data of a specific field we can upstream this data to the whole module data
  upstreamData: function () {
    var ModuleModel;
    if (ModuleModel = this.get('ModuleModel')) {
      var cdata = _.clone(this.get('ModuleModel').get('moduleData'));
      Utilities.setIndex(cdata, this.get('kpath'), this.get('value'));
      ModuleModel.set('moduleData', cdata, {silent: false});
      ModuleModel.View.getDirty();

    }
  },
  /**
   * A linked field was updated
   * @param model
   */
  externalUpdate: function (model) {
    this.FieldControlView.synchronize(model);
  },
  remove: function () {
    this.stopListening();
    KB.FieldControls.remove(this);
  },
  rebind: function () {
    var that = this;
    _.defer(function () {
      if (_.isUndefined(that.getElement())) {
        _.defer(_.bind(that.FieldControlView.gone, that.FieldControlView));
      }
      else if (that.FieldControlView) {
        that.FieldControlView.setElement(that.getElement()); // markup might have changed, reset the root element
        _.defer(_.bind(that.FieldControlView.rerender, that.FieldControlView)); // call rerender on the field
      }
    }, true);
  },
  unbind: function () {
    if (this.FieldControlView && this.FieldControlView.derender) {
      this.FieldControlView.derender(); // call derender
    }
  },
  sync: function (context) {
    var that = this;
    KB.Events.trigger('field.before.sync', this.model);

    var clone = that.toJSON();
    var type = clone.ModuleModel.type;
    var module = clone.ModuleModel.toJSON();

    delete clone['ModuleModel'];
    delete clone['linkedFields'];

    return jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'updateFieldModel',
        data: that.get('value'),
        field: clone,
        module: module,
        type: type,
        _ajax_nonce: Config.getNonce('update')
      },
      context: (context) ? context : that,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        that.trigger('field.model.updated', that);
      },
      error: function () {
        Logger.Debug.error('serialize | FrontendModal | Ajax error');
      }
    });
  }
});