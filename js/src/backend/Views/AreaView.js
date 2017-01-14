//KB.Backbone.Backend.AreaView
var tplAreaItemPlaceholer = require('templates/backend/area-item-placeholder.hbs');
var tplAreaAddModule = require('templates/backend/area-add-module.hbs');
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var AreaControls = require('backend/Views/AreaControls/AreaControlsView');
var StatusControl = require('backend/Views/AreaControls/controls/StatusControl');
var DetachControl = require('backend/Views/AreaControls/controls/DetachControl');
var MoveControl = require('backend/Views/AreaControls/controls/MoveControl');
var Checks = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function () {


    this.attachedModuleViews = {};
    this.$controlsContainer = this.$('.add-modules');
    this.$modulesList = this.$('#' + this.model.get('id'));
    this.$placeholder = jQuery(tplAreaItemPlaceholer({i18n: KB.i18n}));
    this.$footer = this.$('.kb-area--footer');
    this.model.View = this;

    this.listenTo(this, 'module:attached', this.ui);

    this.AreaControls = new AreaControls({
      el: this.$el,
      parent: this
    });

    this.setupDefaultMenuItems();
    this.render();
  },
  events: {
    'click .modules-link': 'openModuleBrowser',
    'mouseenter': 'setActive'
  },
  render: function () {
    this.addControls();
    this.ui();
  },
  resetElement: function () {
    this.setElement('#' + this.model.get('id') + '-container');
    this.initialize();
  },
  addControls: function () {
    var showLimit = (parseInt(this.model.get('limit'), 10) > 0);

    if (Checks.userCan('create_kontentblocks') && this.model.get('assignedModules').length > 1) {
      this.$footer.append(tplAreaAddModule({i18n: KB.i18n, model: this.model.toJSON(), showLimit: showLimit}));
    }
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

  setActive: function () {
    KB.currentArea = this.model;
  },
  attachModuleView: function (ModuleModel) {
    this.attachedModuleViews[ModuleModel.cid] = ModuleModel.View; // add module
    this.listenTo(ModuleModel, 'change:area', this.removeModule); // add listener
    this.trigger('module:attached', ModuleModel);
  },
  removeModule: function (ModuleModel) {
    var id;
    id = ModuleModel.cid;
    if (this.attachedModuleViews[id]) {
      delete this.attachedModuleViews[id]; // remove property
      this.stopListening(ModuleModel, 'change:area', this.removeModule); // remove listener
    }
    this.trigger('module:detached', ModuleModel);
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
    this.$modulesList.before(this.$placeholder);
  },
  setupDefaultMenuItems: function () {
    this.AreaControls.addItem(new StatusControl({model: this.model, parent: this}));
    this.AreaControls.addItem(new DetachControl({model: this.model, parent: this}));
    this.AreaControls.addItem(new MoveControl({model: this.model, parent: this}));
  }

});