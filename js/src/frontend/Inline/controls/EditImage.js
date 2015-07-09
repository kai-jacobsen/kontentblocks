var ModuleMenuItem = require('frontend/Views/ModuleControls/modulecontrols/ControlsBaseView');
var Check = require('common/Checks');
module.exports = ModuleMenuItem.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-format-image"></span>');
  },
  className: 'os-edit-block kb-module-edit',
  attributes: {
    'data-tipsy' : 'change image'
  },
  events: {
    'click' : 'openFrame'
  },
  openFrame: function(){
    this.Parent.openFrame();
  },
  render: function(){
      return this.$el;
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  }
});