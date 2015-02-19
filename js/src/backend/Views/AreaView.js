KB.Backbone.Backend.AreaView = Backbone.View.extend({
  initialize: function () {
    this.attachedModuleViews = {};
    this.controlsContainer = jQuery('.add-modules', this.$el);
    this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
    this.modulesList = jQuery('#' + this.model.get('id'), this.$el);
    this.$placeholder = jQuery(KB.Templates.render('backend/area-item-placeholder', {i18n: KB.i18n}));
    this.model.View = this;

    this.listenTo(this, 'module:attached', this.ui);
    this.listenTo(this, 'module:dettached', this.ui);

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
  addControls: function () {
    this.controlsContainer.append(KB.Templates.render('backend/area-add-module', {i18n: KB.i18n}));
  },
  openModuleBrowser: function (e) {
    e.preventDefault();

    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new KB.Backbone.ModuleBrowser({
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
  }

});