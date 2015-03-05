KB.Backbone.Sidebar.PanelOverview.PanelOverviewController = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-main-panel panel-view',
  Panels: new Backbone.Collection(), // Area models
  PanelViews: {
    option: {},
    page: {}
  }, // attached Area Views
  activeList: null,

  initialize: function (options) {
    this.sidebarController = options.controller;
    this.render();
    this.bindHandlers();
  },
  render: function () {
    return this.$el;
  },
  bindHandlers: function () {
    this.listenTo(KB.Panels, 'add', this.createPanelItem);
  },
  createPanelItem: function (model) {

    if (!model.get('args').frontend) {
      return;
    }

    if (model.get('type') && model.get('type') === 'option') {
      this.PanelViews.option[model.get('baseId')] = new KB.Backbone.OptionPanelView({
        model: model,
        $parent: this.$el,
        controller: this
      })
    }
  },
  renderRootItem: function () {
    return this.sidebarController.$container.append(KB.Templates.render('frontend/sidebar/root-item', {
      text: 'Panels',
      id: 'PanelList'
    }))
  }
});