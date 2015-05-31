//KB.Backbone.Sidebar.Header
var Templates = require('common/Templates');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__header',
  initialize: function(){
    this.$el.append(Templates.render('frontend/sidebar/sidebar-header', {}));
  },
  render: function(){
    return this.$el;
  }

});