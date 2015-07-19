/**
 * That is what is rendered for each module when the user enters frontside editing mode
 * This will initiate the FrontsideEditView
 * TODO: Don't rely on containers to position the controls and calculate position dynamically
 * @type {*|void|Object}
 */
//KB.Backbone.ModuleView
var ModuleControlsView = require('frontend/Views/ModuleControls/ModuleControls');
var Check = require('common/Checks');

var tplModulePlaceholder = require('templates/frontend/module-placeholder.hbs');
module.exports = Backbone.View.extend({
  focus: false,
  $dropZone: jQuery('<div class="kb-module__dropzone"><span class="dashicons dashicons-plus"></span> add </div>'),
  attachedFields: {},
  initialize: function () {
    var that = this;
    // don't init if cap is missing for current user
    if (!Check.userCan('edit_kontentblocks')) {
      return;
    }
    // attach this view to the model
    this.model.View = this;
    this.model.trigger('module.model.view.attached', this);

    // observe model changes
    this.listenTo(this.model, 'change', this.getDirty);
    this.listenTo(this.model, 'module.model.updated', this.getClean);
    // assign this view to the jQuery DOM Node
    this.$el.data('ModuleView', this);

    // init render
    this.render();

    this.setControlsPosition();

    this.Controls = new ModuleControlsView({
      ModuleView: this
    });
  },
  events: {
    "click .kb-module__placeholder": "openOptions",
    "click .kb-module__dropzone": "setDropZone",
    //"click .kb-js-inline-update": "updateModule",
    "click .kb-js-inline-delete": "confirmDelete",
    "click .editable": "reloadModal",
    "mouseenter.first": "setActive",
    "mouseenter.second": "setControlsPosition"
    //"mouseenter.third": "insertDropZone"
    //"mouseleave": "removeDropZone"

  },
  openOptions: function () {
    this.Controls.EditControl.openForm();
  },
  setActive: function () {
    KB.currentModule = this;
  },
  render: function () {
    var settings;

    if (this.$el.hasClass('draft') && this.model.get('moduleData') === '') {
      this.renderPlaceholder();
    }

    //assign rel attribute to handle sortable serialize
    this.$el.attr('rel', this.model.get('mid') + '_' + _.uniqueId());


    settings = this.model.get('settings');
    if (settings.controls && settings.controls.hide) {
      return;
    }

    if (jQuery('.os-controls', this.$el).length > 0) {
      return;
    }

    //this.$el.append(KB.Templates.render('frontend/module-controls', {
    //    model: this.model.toJSON(),
    //    i18n: KB.i18n.jsFrontend
    //}));


  },
  setControlsPosition: function () {
    var elpostop, elposleft, mSettings, $controls, pos, height;
    elpostop = 0;
    elposleft = 0;

    mSettings = this.model.get('settings');

    $controls = jQuery('.os-controls', this.$el);
    pos = this.$el.offset();
    height = this.$el.height();


    if (mSettings.controls && mSettings.controls.toolbar) {
      pos.top = mSettings.controls.toolbar.top;
      pos.left = mSettings.controls.toolbar.left;
    }

    // small item with enough space above
    // position is at top outside of the element (headlines etc)
    if (this.$el.css('overflow') !== 'hidden' && pos.top > 60 && height < 119) {
      elpostop = -25;
    }

    // enough space on the left side
    // menu will be rendered vertically on the left
    if (this.$el.css('overflow') !== 'hidden' && pos.left > 100 && height > 120 && this.$el.class) {
      elpostop = 0;
      elposleft = -30;
      $controls.addClass('kb-module-nav__vertical');
    }

    if (pos.top < 20) {
      elpostop = 10;
    }

    $controls.css({'top': elpostop + 'px', 'left': elposleft});
  },

  reloadModal: function (force) {

    if (KB.EditModalModules) {
      KB.EditModalModules.reload(this, force);
    }
    KB.CurrentModel = this.model;
    KB.focusedModule = this.model;
    return this;
  },
  insertDropZone: function () {
    this.focus = true;
    this.$el.append(this.$dropZone);
  },
  removeDropZone: function () {
    this.focus = false;
    this.$el.find('.kb-module__dropzone').remove();
  },
  setDropZone: function () {
    var ModuleBrowser;
    ModuleBrowser = this.Area.openModuleBrowser();
    ModuleBrowser.dropZone = this;
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
  },
  getClean: function () {
    this.$el.removeClass('isDirty');
  },
  modelChange: function () {
    this.getDirty();
  },
  save: function () {
    // TODO utilize this for saving instead of handling this by the modal view
  },
  dispose: function () {
    delete this.model.View;
    this.stopListening();
    this.remove();
  }
});