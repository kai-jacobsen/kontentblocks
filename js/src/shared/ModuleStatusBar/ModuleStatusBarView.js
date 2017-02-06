var ControlsView = require('backend/Views/ModuleControls/ControlsView');

module.exports = ControlsView.extend({
  tagName: 'div',
  className: 'kb-module--status-bar-list',
  initialize: function (options) {
    this.$menuWrap = jQuery('.kb-module--status-bar', this.$el); //set outer element
    this.$menuWrap.append("<div class='kb-module--status-bar-list'></div>"); // render template
    this.$menuList = jQuery('.kb-module--status-bar-list', this.$menuWrap);
  }

});