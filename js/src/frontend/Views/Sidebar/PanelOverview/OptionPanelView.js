
module.exports= Backbone.View.extend({

  tagName: 'div',
  className: 'kb-sidebar__panel-item',
  initialize: function (options) {
    this.$parent = options.$parent;
    this.Controller = options.controller;
    //this.setupFormView();
    this.render();
  },
  events: {
    'click': 'setupFormView'
  },
  render: function () {
    this.$el.append(KB.Templates.render('frontend/sidebar/panel-list-item', {name: this.model.get('args').menu.name}));
    return this.$parent.append(this.$el);
  },
  setupFormView: function () {
    this.FormView = new KB.Backbone.Sidebar.OptionsPanelFormView({
      model: this.model,
      controller: this.Controller,
      parentView: this
    });
    this.Controller.sidebarController.setExtendedView(this.FormView);
  },
  closeDetails: function () {
    this.Controller.sidebarController.closeExtendedView();
  }
});
