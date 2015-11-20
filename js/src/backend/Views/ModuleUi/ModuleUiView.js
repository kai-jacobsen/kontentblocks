var ControlsView = require('backend/Views/ModuleControls/ControlsView');
var tplUiMenu = require('templates/backend/ui-menu.hbs');
module.exports = ControlsView.extend({
  initialize: function () {

    this.$menuWrap = jQuery('.ui-wrap', this.$el); //set outer element
    this.$menuWrap.append(tplUiMenu({})); // render template
    this.$menuList = jQuery('.ui-actions', this.$menuWrap);
  }
});