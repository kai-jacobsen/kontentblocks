'use strict';
var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.AreaView = Backbone.View.extend({
    initialize: function() {
        this.controlsContainer = jQuery('.add-modules', this.$el);
        this.modulesList = jQuery('#' + this.model.get('id') + '-list', this.$el);
        this.render();
    },
    events: {
        'click .modules-link': 'openModulesMenu'
    },
    render: function() {
        this.addControls();
    },
    addControls: function() {
        this.controlsContainer.append(KB.Templates.render('be_areaAddModule', {}));
    },
    openModulesMenu: function() {
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
    }

});