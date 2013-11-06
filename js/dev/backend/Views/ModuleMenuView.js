'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null,
    $menuList: null,
    events: {
        'click .kb_menu_opener' : 'toggleMenu'
    },
    initialize: function() {
        this.$menuWrap = jQuery('.menu-wrap', this.$el);
        this.$menuWrap.append(KB.Templates.render('be_moduleMenu', {}));
        this.$menuList = jQuery('.module-actions', this.$menuWrap);
    },
    addItem: function(view, model) {

        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
    },
    toggleMenu: function(){
        this.$menuList.fadeToggle(250);
    }
});