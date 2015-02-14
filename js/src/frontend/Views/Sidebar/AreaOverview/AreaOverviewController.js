KB.Backbone.Sidebar.AreaOverview.AreaOverviewController = Backbone.View.extend({
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
    return this.$el;
  },
  bindHandlers: function () {
    this.listenTo(KB.Views.Areas, 'view:add', this.attachAreaView);
    this.listenTo(KB.Views.Modules, 'view:add', this.attachModuleView);
    this.listenTo(this.Areas, 'add', this.createAreaItem);
  },
  attachAreaView: function (view) {
    this.Areas.add(view.model);
  },
  attachModuleView: function (view) {
    var AreaView = this.AreaViews[view.model.get('area')];
    if (AreaView) {
      AreaView.attachModuleView(view);
    }
  },
  createAreaItem: function (model) {
    if (!model.get('internal')) {
      var $item = jQuery(KB.Templates.render('frontend/sidebar/sidebar-area-view', model.toJSON())).appendTo(this.$el);
      this.AreaViews[model.get('id')] = new KB.Backbone.Sidebar.AreaOverview.AreaListItem({
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

  }
});