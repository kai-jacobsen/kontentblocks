'use strict';

var KB = KB || {};
KB.Backbone = KB.Backbone || {};

KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null,
    $menuList: null,
    events: {
        
    },
    initialize: function() {
        this.$menuWrap = jQuery('.menu-wrap', this.$el);
        this.$menuWrap.append(KB.Templates.render('be_moduleMenu', {}));

        this.$menuList = jQuery('.kb_the_menu', this.$menuWrap);
    },
    addItem: function(view, model) {
        
        if (view.isValid && view.isValid() === true){
            var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
        
    }
});