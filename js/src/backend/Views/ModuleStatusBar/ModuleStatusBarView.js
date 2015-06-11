var ControlsView = require('backend/Views/ModuleControls/ControlsView');
var tplStatusBar = require('templates/backend/status-bar.hbs');

module.exports = ControlsView.extend({
  tagName: 'ul',
  className: 'kb-module--status-bar-list',
  initialize: function (options) {
    this.$menuWrap = jQuery('.kb-module--status-bar', this.$el); //set outer element
    this.$menuWrap.append(tplStatusBar({})); // render template
    this.$menuList = jQuery('.kb-module--status-bar-list', this.$menuWrap);
  }

});