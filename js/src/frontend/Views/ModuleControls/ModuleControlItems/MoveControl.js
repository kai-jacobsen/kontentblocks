KB.Backbone.Frontend.ModuleMove = KB.Backbone.Frontend.ModuleMenuItemView.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-menu"></span><span class="os-action"></span>');
  },
  className: 'kb-module-inline-move kb-nbt kb-nbb',
  isValid: function () {

    if (!this.Parent.Area){
      return false;
    }
    return KB.Checks.userCan('edit_kontentblocks') && this.Parent.Area.get('sortable');
  }
});