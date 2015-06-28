//KB.Backbone.Backend.AreaView
var tplAreaItemPlaceholer = require('templates/backend/area-item-placeholder.hbs');
var tplAreaAddModule = require('templates/backend/area-add-module.hbs');
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var AreaControls = require('backend/Views/AreaControls/AreaControlsView');
var StatusControl = require('backend/Views/AreaControls/controls/StatusControl');
var DetachControl = require('backend/Views/AreaControls/controls/DetachControl');
var MoveControl = require('backend/Views/AreaControls/controls/MoveControl');
module.exports = Backbone.View.extend({
  initialize: function () {
    this.attachedModuleViews = {};
    this.controlsContainer = jQuery('.add-modules', this.$el);
    this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
    this.modulesList = jQuery('#' + this.model.get('id'), this.$el);

    this.$placeholder = jQuery(tplAreaItemPlaceholer({i18n: KB.i18n}));
    this.model.View = this;

    this.listenTo(this, 'module:attached', this.ui);
    this.listenTo(this, 'module:dettached', this.ui);

    this.AreaControls = new AreaControls({
      el: this.$el,
      parent: this
    });
    this.setupDefaultMenuItems();
    this.render();
  },
  events: {
    'click .modules-link': 'openModuleBrowser',
    'click .js-area-settings-opener': 'toggleSettings',
    'mouseenter': 'setActive'
  },
  render: function () {
    this.addControls();
    this.ui();
  },
  resetElement: function(){
      this.setElement('#' + this.model.get('id') + '-container');
      this.initialize();
  },
  addControls: function () {
    this.controlsContainer.append(tplAreaAddModule({i18n: KB.i18n}));
  },
  openModuleBrowser: function (e) {
    e.preventDefault();

    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this
      });
    }
    this.ModuleBrowser.render();

  },
  toggleSettings: function (e) {
    e.preventDefault();
    this.settingsContainer.slideToggle().toggleClass('open');
    KB.currentArea = this.model;
  },
  setActive: function () {
    KB.currentArea = this.model;
  },
  attachModuleView: function (ModuleModel) {
    this.attachedModuleViews[ModuleModel.id] = ModuleModel.View; // add module
    this.listenTo(ModuleModel, 'change:area', this.removeModule); // add listener
    this.trigger('module:attached', ModuleModel);
  },
  removeModule: function (ModuleModel) {
    var id;
    id = ModuleModel.id;
    if (this.attachedModuleViews[id]) {
      delete this.attachedModuleViews[id]; // remove property
      this.stopListening(ModuleModel, 'change:area', this.removeModule); // remove listener
    }
    this.trigger('module:dettached', ModuleModel);
  },
  ui: function () {
    var size;
    size = _.size(this.attachedModuleViews);
    if (size === 0) {
      this.renderPlaceholder();
    } else {
      this.$placeholder.remove();
    }
  },
  renderPlaceholder: function () {
    this.modulesList.before(this.$placeholder);
  },
  setupDefaultMenuItems: function(){
    this.AreaControls.addItem(new StatusControl({model: this.model, parent: this}));
    this.AreaControls.addItem(new DetachControl({model: this.model, parent: this}));
    this.AreaControls.addItem(new MoveControl({model: this.model, parent: this}));
  }

});