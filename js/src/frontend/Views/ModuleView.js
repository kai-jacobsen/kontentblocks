var ModuleControlsView = require('frontend/Views/ModuleControls/ModuleControls');
var Check = require('common/Checks');
var ModuleStatusBarView = require('shared/ModuleStatusBar/ModuleStatusBarView');
var TemplatesStatus = require('shared/ModuleStatusBar/status/TemplateStatus');
var PublishStatus = require('shared/ModuleStatusBar/status/PublishStatus');

var tplModulePlaceholder = require('templates/frontend/module-placeholder.hbs');
module.exports = Backbone.View.extend({
  focus: false,
  attachedFields: {},
  initialize: function () {
    this.Controls = new ModuleControlsView({
      ModuleView: this,
      model: this.model
    });

    if (this.$el.length === 0){
      return;
    }

    // don't init if cap is missing for current user
    if (!Check.userCan('edit_kontentblocks')) {
      return;
    }
    // attach this view to the model
    this.model.View = this;

    this.model.trigger('module.model.view.attached', this);
    // observe model changes

    this.bindHandlers();

    // init render
    this.render();

    KB.Events.on('reposition', this.setControlsPosition, this);

  },
  bindHandlers: function () {
    this.listenTo(this.model, 'change', this.getDirty);
    this.listenTo(this.model, 'module.model.updated', this.getClean);
    this.listenTo(this.model, 'module.model.clean', this.getClean);
  },
  events: {
    "click .kb-module__placeholder": "openOptions",
    "click .editable": "reloadModal",
    "mouseenter.first": "setActive"
  },
  renderStatusBar: function($el){
    this.ModuleStatusBar = new ModuleStatusBarView({
      el: $el,
      parent: this
    });
    this.ModuleStatusBar.addItem(new TemplatesStatus({model: this.model, parent: this}));
    this.ModuleStatusBar.addItem(new PublishStatus({model: this.model, parent: this}));

  },
  openOptions: function () {
    this.Controls.EditControl.openForm();
  },
  setActive: function () {
    KB.currentModule = this;
  },
  rerender: function () {
    var that = this;
    this.setElement(jQuery('#' + this.model.get('mid')));
    _.defer(function(){
      that.Controls.rerender();
    });
  },
  derender:function(){
    this.Controls.derender();
    this.$el.remove();
  },
  render: function () {
    var settings;

    if (this.$el.hasClass('draft') && this.$el.html() == '') {
      this.renderPlaceholder();
    }
    //assign rel attribute to handle sortable serialize
    this.$el.attr('rel', this.model.get('mid') + '_' + _.uniqueId());

    settings = this.model.get('settings');
    if (settings.controls && settings.controls.hide) {
      return;
    }
    this.Controls.render();
    this.setControlsPosition();
  },
  setControlsPosition: function () {
    this.Controls.reposition();
  },

  reloadModal: function (force) {
    if (KB.EditModalModules) {
      KB.EditModalModules.reload(this, force);
    }
    KB.focusedModule = this.model;
    return this;
  },
  renderPlaceholder: function () {
    this.$el.append(tplModulePlaceholder({
      model: this.model.toJSON()
    }));
  },
  addField: function (obj) {
    this.attachedFields[obj.cid] = obj;
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
  getDirty: function () {
    this.$el.addClass('isDirty');
    this.trigger('view.became.dirty', this);
  },
  getClean: function () {
    this.$el.removeClass('isDirty');
    this.trigger('view.became.clean', this);
  },
  modelChange: function () {
    this.getDirty();
  },
  dispose: function () {
    this.Controls.dispose();
    delete this.model.View;
    this.stopListening();
    this.remove();
  }

});