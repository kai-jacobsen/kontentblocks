var ControlsView = require('backend/Views/ModuleControls/ControlsView');

module.exports = ControlsView.extend({
  tagName: 'ul',
  className: 'kb-module--status-bar-list',
  initialize: function (options) {
    this.$menuWrap = jQuery('.kb-module--status-bar', this.$el); //set outer element
    this.$menuWrap.append("<ul class='kb-module--status-bar-list'></ul>"); // render template
    this.$menuList = jQuery('.kb-module--status-bar-list', this.$menuWrap);
  }

});