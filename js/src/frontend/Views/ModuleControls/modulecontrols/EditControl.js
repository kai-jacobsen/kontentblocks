var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.parent = options.parent;
  },
  className: 'kb-module-control kb-module-control--edit',
  events: {
    'click': 'openForm'
  },
  openForm: function () {
    KB.EditModalModules.openView(this.parent,false,false);
    KB.focusedModule = this.model;
    return this;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  }
});