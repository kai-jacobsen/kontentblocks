var KB = KB || {};
// Kontentblocks Backbone namespacing
KB.Backbone = KB.Backbone || {};

/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
KB.Backbone.ModuleMenuView = Backbone.View.extend({
    $menuWrap: null, // wrap container jQuery element
    $menuList: null, // ul item

    initialize: function() {
        this.$menuWrap = jQuery('.menu-wrap', this.$el); //set outer element
        this.$menuWrap.append(KB.Templates.render('be_moduleMenu', {})); // render template
        this.$menuList = jQuery('.module-actions', this.$menuWrap);
    },
    /**
     * Add an module menu action item
     * @param view view handler for item
     * @param model corresponding model
     */
    addItem: function(view, model) {
        // 'backend' to add menu items
        // actually happens in ModuleView.js
        // this functions validates action by calling 'isValid' on menu item view
        // if isValid render the menu item view
        // see /ModuleMenuItems/ files for action items
        if (view.isValid && view.isValid() === true) {
            var $liItem = jQuery('<li></li>').appendTo(this.$menuList);
            var $menuItem = $liItem.append(view.el);
            this.$menuList.append($menuItem);
        }
    }
});