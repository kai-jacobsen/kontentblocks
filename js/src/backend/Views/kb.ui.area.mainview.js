KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function () {
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id'), this.$el);
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
    },
    addControls: function () {
        this.controlsContainer.append(KB.Templates.render('backend/area-add-module', {i18n : KB.i18n}));
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
    setActive: function(){
        KB.currentArea = this.model;
    }

});