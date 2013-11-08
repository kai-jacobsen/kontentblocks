'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function() {
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.settingsContainer = jQuery('.kb-area-settings-wrapper', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id'), this.$el);
        this.model.view = this;
        this.render();
        console.log(this);
    },
    events: {
        'click .modules-link': 'openModulesMenu',
        'click .js-area-settings-opener' : 'toggleSettings'
    },
    render: function() {
        this.addControls();
    },
    addControls: function() {
        this.controlsContainer.append(KB.Templates.render('be_areaAddModule', {}));
    },
    openModulesMenu: function(e) {
        e.preventDefault();
        var that = this;
        KB.openedModal = vex.open({
            content: jQuery('#' + that.model.get('id') + '-nav').html(),
            afterOpen: function() {
                KB.menutabs();
                that.menuView = new KB.Backbone.AreaModuleMenuView({
                    el: this.$vexContent,
                    area: that.model.get('id'),
                    parentView: that
                });
            },
            afterClose: function(){
                that.menuView.remove();
            },
            contentClassName: 'modules-menu'
        }) || null;
    },
    toggleSettings:function(e){
        e.preventDefault();
        this.settingsContainer.slideToggle().toggleClass('open');
        KB.currentArea = this.model;
    }

});