/**
 * Creates the individual module-actions menu
 * like: duplicate, delete, status
 */
//KB.Backbone.Backend.ModuleControlsView
module.exports = Backbone.View.extend({
  id: '',
  $menuWrap: {}, // wrap container jQuery element
  $menuList: {}, // ul item
  initialize: function (options) {
    this.parent = options.parent;
    this.$menuWrap = jQuery('.menu-wrap', this.$el); //set outer element
    this.$menuWrap.append("<div class='module-actions'></div>"); // render template
    this.$menuList = jQuery('.module-actions', this.$menuWrap);
  },
  /**
   * Add an module menu action item
   * @param view view handler for item
   */
  addItem: function (view) {
    this.controls = this.controls || {};
    // var cap = this.parent.model.get('settings').cap;
    // console.log(cap);

    // 'backend' to add menu items
    // actually happens in ModuleView.js
    // this functions validates action by calling 'isValid' on menu item view
    // if isValid render the menu item view
    // see /ModuleMenuItems/ files for action items
    if (view.isValid && view.isValid() === true) {
      var $liItem = jQuery('<div class="kb-controls-item"></div>').appendTo(this.$menuList);
      var $menuItem = $liItem.append(view.el);
      this.$menuList.append($menuItem);
      view.render.call(view);
      this.controls[view.id] = view;
    }
  },
  getView: function (id) {
    if (this.controls[id]) {
      return this.controls[id];
    }
    return false;
  }
});