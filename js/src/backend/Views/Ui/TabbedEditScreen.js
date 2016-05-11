module.exports = Backbone.View.extend({
  el: '#kb-contexts-tabs',
  initialize: function(){
    var that =this;
    var $tabs = this.$el.tabs({});

    var $tabItems = jQuery("ul:first li", $tabs).droppable({
      accept: ".kb-module-ui__sortable--connect li",
      hoverClass: "ui-state-hover",
      tolerance: 'pointer',
      over: function(e, ui){
        var $item = jQuery(this);
        that.$el.tabs("option", "active", $tabItems.index($item));
        that.$('.kb-module-ui__sortable').sortable("refresh");
      }
    });
  }
});