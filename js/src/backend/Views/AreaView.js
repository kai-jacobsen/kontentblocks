KB.Backbone.Backend.AreaView = Backbone.View.extend({
    initialize: function () {
        this.attachedModuleViews = {};
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id'), this.$el);
        this.$placeholder = jQuery(KB.Templates.render('backend/area-item-placeholder', {i18n: KB.i18n}));
        this.model.view = this;
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
    addModuleView: function (moduleView) {
        this.attachedModuleViews[moduleView.model.get('instance_id')] = moduleView; // add module
        this.listenTo(moduleView.model, 'change:area', this.removeModule); // add listener
        _K.info('Module:' + moduleView.model.id + ' was added to area:' + this.model.id);
        //moduleView.model.area = this.model;
        //@TODO investigate model.areaView usage
        moduleView.model.areaView = this;
        moduleView.Area = this;
        this.ui();
    },
    removeModule: function (model) {
        var id;
        id = model.id;
        if (this.attachedModuleViews[id]) {
            delete this.attachedModuleViews[id]; // remove property
            _K.info('Module:' + id + ' was removed from area:' + this.model.id);
            this.stopListening(model, 'change:area', this.removeModule); // remove listener
        }

        this.ui();
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