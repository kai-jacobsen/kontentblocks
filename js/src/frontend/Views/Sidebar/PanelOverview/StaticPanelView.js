var tplPanelListItem = require('templates/frontend/sidebar/panel-list-item.hbs');
var StaticPanelFormView = require('frontend/Views/Sidebar/PanelDetails/StaticPanelFormView');
module.exports = Backbone.View.extend({

  tagName: 'div',
  className: 'kb-sidebar__panel-item',
  initialize: function (options) {
    this.$parent = options.$parent;
    this.Controller = options.controller;
    //this.setupFormView();
    this.render();
  },
  events: {
    'click' : 'setupFormView'
  },
  render: function () {
    this.$el.append(tplPanelListItem({ name: this.model.get('settings').baseId} ));
    return this.$parent.append(this.$el);
  },
  setupFormView: function(){
    this.FormView = new StaticPanelFormView({
      model: this.model,
      controller: this.Controller,
      parentView: this
    });
    this.Controller.sidebarController.setExtendedView(this.FormView);
  },
  closeDetails: function(){
    this.Controller.sidebarController.closeExtendedView();
  }
});
