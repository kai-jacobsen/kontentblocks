//KB.Backbone.Frontend.ModuleMove
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="genericon genericon-draggable"></span><span class="os-action"></span>');
  },
  className: 'kb-module-inline-move kb-nbt kb-nbb',
  attributes: {
    'data-tipsy' : 'move module inside area'
  },
  isValid: function () {
    if (!this.Parent.model.Area){
      return false;
    }
    return Check.userCan('edit_kontentblocks') && this.Parent.model.Area.get('sortable');
  }
});