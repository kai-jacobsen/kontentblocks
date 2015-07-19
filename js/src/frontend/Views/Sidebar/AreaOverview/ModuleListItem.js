//KB.Backbone.Sidebar.AreaOverview.ModuleListItem
var tplModuleViewItem = require('templates/frontend/sidebar/module-view-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    // parent area list
    this.$parent = options.$parent;
    // the actual DOM View
    this.parentView = this.model.View;
    this.bindHandlers();
    this.render();
  },
  events: {
    'mouseenter': 'over',
    'mouseleave': 'out',
    "click": 'scrollTo',
    "click .kb-sidebar-item__edit": "openControls",
    'click .kb-js-inline-update': 'inlineUpdate',
    'click .kb-js-inline-delete': 'inlineDelete'
  },
  bindHandlers: function () {
    this.listenTo(this.model, 'change', this.getDirty);
    this.listenTo(this.model, 'module.model.updated', this.getClean);
  },
  getDirty: function () {
    this.$el.addClass('kb-module-dirty');
  },
  getClean:function(){
    this.$el.removeClass('kb-module-dirty');
  },
  over: function () {
    this.parentView.$el.addClass('kb-in-sidebar-active');
  },
  out: function () {
    this.parentView.$el.removeClass('kb-in-sidebar-active');

  },
  openControls: function (e) {
    e.stopPropagation();
    this.parentView.openOptions();
  },
  inlineUpdate: function (e) {
    e.stopPropagation();
    this.parentView.Controls.UpdateControl.update();
    this.parentView.getClean();
  },
  inlineDelete: function(e){
    e.stopPropagation();
    this.parentView.Controls.DeleteControl.confirmRemoval();
  },
  scrollTo: function () {
    var that = this;
    jQuery('html, body').animate({
      scrollTop: that.parentView.$el.offset().top - 100
    }, 750);
  },
  render: function () {
    this.$el.append(tplModuleViewItem({view: this.model.toJSON()}));
    //this.$el.appendTo(this.$parent);
  },
  dispose: function(){
    this.stopListening();
    this.remove();
    delete this.model;
    delete this.parentView;
  }
});
