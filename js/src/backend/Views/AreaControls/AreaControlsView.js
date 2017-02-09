var ControlsView = require('backend/Views/ModuleControls/ControlsView');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuWrap = jQuery('.kb-area__title-text', this.$el); //set outer element
    this.$menuWrap.append("<div class='kb-area-actions'><div class='kb-area-actions-list'></div></div>"); // render template
    this.$menuList = jQuery('.kb-area-actions-list', this.$menuWrap);
  }
});