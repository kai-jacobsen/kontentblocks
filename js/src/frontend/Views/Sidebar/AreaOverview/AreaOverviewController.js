//KB.Backbone.Sidebar.AreaOverview.AreaOverviewController
var AreaListItem = require('frontend/Views/Sidebar/AreaOverview/AreaListItem');
var tplSidebarAreaView = require('templates/frontend/sidebar/sidebar-area-view.hbs');
var tplRootItem = require('templates/frontend/sidebar/root-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-main-panel',
  Areas: new Backbone.Collection(), // Area models
  AreaViews: {}, // attached Area Views
  activeList: null,
  events: {
    'click .kb-sidebar-areaview__title': 'toggleList'
  },
  initialize: function (options) {
    this.sidebarController = options.controller;
    this.render();
    this.bindHandlers();
  },
  render: function () {
    // this.$el is the main wrapper for the area overview list
    return this.$el;
  },
  bindHandlers: function () {
    this.listenTo(KB.Views.Areas, 'view:add', this.attachAreaView);
    this.listenTo(KB.Views.Modules, 'view:add', this.attachModuleView);
    this.listenTo(this.Areas, 'add', this.createAreaItem);
  },
  attachAreaView: function (view) {
    if (view.el) { // make sure the area is present in the DOM
      this.Areas.add(view.model);
    }
  },
  attachModuleView: function (view) {
    var AreaView = this.AreaViews[view.model.get('area')];
    if (AreaView) {
      AreaView.attachModuleView(view);
    }
  },
  createAreaItem: function (model) {
    // render area item skeleton markup for each area
    if (!model.get('internal')) { // ignore internal system areas
      var $item = jQuery(tplSidebarAreaView(model.toJSON())).appendTo(this.$el);
      this.AreaViews[model.get('id')] = new AreaListItem({
        $el: $item,
        controller: this,
        sidebarController: this.sidebarController,
        model: model
      })
    }
  },
  setActiveList: function (AreaView) {
    // is null
    if (!this.activeList || !this.activeList.cid) {
      this.activeList = AreaView;
      AreaView.$el.slideDown();
      AreaView.activate();
      return true;
    }
    if (this.activeList.cid === AreaView.cid) {
      return false;
    } else {
      this.activeList.$el.slideUp();
      this.activeList.deactivate();
      this.activeList = null;
      this.setActiveList(AreaView);
    }

  },
  renderRootItem: function () {
    return this.sidebarController.$container.append(tplRootItem({
      text: 'Areas',
      id: 'AreaList'
    }))
  }
});