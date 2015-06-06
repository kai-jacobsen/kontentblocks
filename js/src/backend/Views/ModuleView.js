//KB.Backbone.Backend.ModuleView
var ModuleControlsView = require('backend/Views/ModuleControls/ControlsView');
var ModuleUiView = require('backend/Views/ModuleUi/ModuleUiView');
var DeleteControl = require('backend/Views/ModuleControls/controls/DeleteControl');
var DuplicateControl = require('backend/Views/ModuleControls/controls/DuplicateControl');
var SaveControl = require('backend/Views/ModuleControls/controls/SaveControl');
var StatusControl = require('backend/Views/ModuleControls/controls/StatusControl');
var MoveControl = require('backend/Views/ModuleUi/controls/MoveControl');
var ToggleControl = require('backend/Views/ModuleUi/controls/ToggleControl');
var Checks = require('common/Checks');
var Ajax = require('common/Ajax');
var UI = require('common/UI');
var Payload = require('common/Payload');
module.exports = Backbone.View.extend({
  $head: {}, // header jQuery element
  $body: {}, // module inner jQuery element
  ModuleMenu: {}, // Module action like delete, hide etc...
  instanceId: '',
  events: {
    // show/hide module inner
    // actual module actions are outsourced to individual files
    'mouseenter': 'setFocusedModule',
    'change .kb-template-select': 'viewfileChange',
    'change input,textarea,select': 'handleChange',
    'tinymce.change': 'handleChange'

  },
  setFocusedModule: function () {
    KB.focusedModule = this.model;
  },
  handleChange: function () {
    this.trigger('kb::module.input.changed', this);
  },
  viewfileChange: function (e) {
    this.model.set('viewfile', e.currentTarget.value);
    this.clearFields();
    this.updateModuleForm();
    this.trigger('KB::backend.module.viewfile.changed');
  },
  initialize: function () {
    // Setup Elements
    this.$head = jQuery('.kb-module__header', this.$el);
    this.$body = jQuery('.kb-module__body', this.$el);
    this.$inner = jQuery('.kb-module__controls-inner', this.$el);
    this.attachedFields = {};
    this.instanceId = this.model.get('instance_id');
    // create new module actions menu
    this.ModuleMenu = new ModuleControlsView({
      el: this.$el,
      parent: this
    });

    this.ModuleUi = new ModuleUiView({
      el: this.$el,
      parent: this
    });


    // set view on model for later reference
    this.model.View = this;
    // Setup View
    this.setupDefaultMenuItems();
    this.setupDefaultUiItems();

    KB.Views.Modules.on('kb.modules.view.deleted', function (view) {
      view.$el.fadeOut(500, function () {
        view.$el.remove();
      });
    });
  },
  // setup default actions for modules
  // duplicate | delete | change active status
  setupDefaultMenuItems: function () {
    // actual action is handled by individual files
    this.ModuleMenu.addItem(new SaveControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new DuplicateControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new DeleteControl({model: this.model, parent: this}));
    this.ModuleMenu.addItem(new StatusControl({model: this.model, parent: this}));
  },
  setupDefaultUiItems: function () {
    this.ModuleUi.addItem(new MoveControl({model: this.model, parent: this}));
    this.ModuleUi.addItem(new ToggleControl({model: this.model, parent: this}));
  },
  // get called when a module was dragged to a different area / area context
  updateModuleForm: function () {
    Ajax.send({
      action: 'afterAreaChange',
      module: this.model.toJSON(),
      _ajax_nonce: Config.getNonce('read')
    }, this.insertNewUpdateForm, this);
  },
  insertNewUpdateForm: function (response) {
    if (response.success) {
      this.$inner.html(response.data.html);
    } else {
      this.$inner.html('empty');
    }
    if (response.data.json.Fields) {
      KB.payload.Fields = _.extend(Payload.getPayload('Fields'), response.data.json.Fields);
    }
    // re-init UI listeners
    Ui.repaint(this.$el);
    KB.Fields.trigger('update');
    this.trigger('kb:backend::viewUpdated');
    this.model.trigger('after.change.area');
  },
  serialize: function () {
    var formData, moduleData;
    formData = jQuery('#post').serializeJSON();
    moduleData = formData[this.model.get('instance_id')];
    // remove supplemental data
    // @TODO check if this can be rafcatored to a subarray
    delete moduleData.areaContext;
    //delete moduleData.viewfile;
    delete moduleData.moduleName;

    this.trigger('kb::module.data.updated');
    return moduleData;
  },
  addField: function (key, obj, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      this.attachedFields[arrayKey][key] = obj;
    } else {
      this.attachedFields[key] = obj;
    }
  },
  hasField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      if (!this.attachedFields[arrayKey]) {
        this.attachedFields[arrayKey] = {};
      }
      return key in this.attachedFields[arrayKey];
    } else {
      return key in this.attachedFields;
    }

  },
  getField: function (key, arrayKey) {
    if (!_.isEmpty(arrayKey)) {
      return this.attachedFields[arrayKey][key];
    } else {
      return this.attachedFields[key];
    }
  },
  clearFields: function () {
    this.attachedFields = {};
  },
  dispose: function () {

  }
});