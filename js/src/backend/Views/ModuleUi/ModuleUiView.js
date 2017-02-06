var ControlsView = require('backend/Views/ModuleControls/ControlsView');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuWrap = jQuery('.ui-wrap', this.$el); //set outer element
    this.$menuWrap.append("<div class='ui-actions'></div>"); // render template
    this.$menuList = jQuery('.ui-actions', this.$menuWrap);
  }
});