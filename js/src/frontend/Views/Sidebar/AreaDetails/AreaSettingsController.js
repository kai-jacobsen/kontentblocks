//KB.Backbone.Sidebar.AreaDetails.AreaSettings
var Payload = require('common/Payload');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  className: 'kb-sidebar-area-details__templates',
  initialize: function (options) {
    this.controller = options.controller;
    this.sidebarController = options.SidebarController;
    this.setOptions();
  },
  render: function () {
    return this.$el;
  },
  setOptions: function () {
    var options = '';
  }
});
