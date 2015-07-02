var ControlsView = require('backend/Views/ModuleControls/ControlsView');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuList = jQuery('.kb-context-bar--actions', this.$el);
  }
});