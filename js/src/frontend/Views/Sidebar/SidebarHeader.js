KB.Backbone.Sidebar.Header = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__header',
  initialize: function(){
    this.$el.append(KB.Templates.render('frontend/sidebar/sidebar-header', {}));
  },
  render: function(){
    return this.$el;
  }

});