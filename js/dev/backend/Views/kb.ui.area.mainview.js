var KB = KB || {};
KB.Backbone = KB.Backbone || {};

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
        'click .js-area-settings-opener': 'toggleSettings'
    },
    render: function () {
        this.addControls();
    },
    addControls: function () {
        this.controlsContainer.append(KB.Templates.render('area-add-module', {
            
        }));
    },
    openModuleBrowser: function (e) {
        e.preventDefault();

        KB.ModuleBrowser = null;

        if (!KB.ModuleBrowser) {
            KB.ModuleBrowser = new KB.Backbone.ModuleBrowser({
                area: this
            });
        }

        KB.ModuleBrowser.render();

    },


    toggleSettings: function (e) {
        e.preventDefault();
        this.settingsContainer.slideToggle().toggleClass('open');
        KB.currentArea = this.model;
    }

});