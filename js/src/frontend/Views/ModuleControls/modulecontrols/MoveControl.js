//KB.Backbone.Frontend.ModuleMove
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--move',
  isValid: function () {
    if (!this.Parent.model.Area){
      return false;
    }
    return Check.userCan('edit_kontentblocks') && this.Parent.model.Area.get('sortable');
  }
});