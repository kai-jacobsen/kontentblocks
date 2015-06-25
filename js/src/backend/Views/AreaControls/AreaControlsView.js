var ControlsView = require('backend/Views/ModuleControls/ControlsView');
var tplControls = require('templates/backend/area-controls-menu.hbs');
module.exports = ControlsView.extend({
  initialize: function () {
    this.$menuWrap = jQuery('.kb-area-actions', this.$el); //set outer element
    this.$menuWrap.append(tplControls({})); // render template
    this.$menuList = jQuery('.kb-area-actions-list', this.$menuWrap);
  }
});