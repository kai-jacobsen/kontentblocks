//KB.Backbone.Frontend.ModuleEdit
var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--edit',
  events: {
    'click': 'openForm'
  },
  openForm: function () {
    KB.EditModalModules.openView(this.Parent);
    KB.focusedModule = this.model;
    return this;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  success: function () {

  }
});