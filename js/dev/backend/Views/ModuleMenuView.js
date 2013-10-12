'use strict';

var KB = KB || {};

KB.ModuleMenuView = Backbone.View.extend({
    
    $menuWrap : null,
    items : [],
    
    initialize: function(){
        this.$menuWrap = jQuery('.menu-wrap', this.$el);
        
    }
});