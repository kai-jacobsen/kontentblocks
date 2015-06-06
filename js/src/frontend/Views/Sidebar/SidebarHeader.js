//KB.Backbone.Sidebar.Header
var tplSidebarHeader = require('templates/frontend/sidebar/sidebar-header.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__header',
  initialize: function () {
    this.$el.append(tplSidebarHeader({}));
  },
  render: function () {
    return this.$el;
  }

});