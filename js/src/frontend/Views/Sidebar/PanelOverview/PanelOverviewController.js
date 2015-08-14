var StaticPanelView = require('frontend/Views/Sidebar/PanelOverview/StaticPanelView');
var OptionPanelView = require('frontend/Views/Sidebar/PanelOverview/OptionPanelView');
var tplRootItem = require('templates/frontend/sidebar/root-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar-main-panel panel-view',
  Panels: new Backbone.Collection(), // Area models
  PanelViews: {
    option: {},
    static: {}
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
    if (!model.get('settings').frontend) {
      return;
    }


    if (model.get('type') && model.get('type') === 'option') {
      this.PanelViews.option[model.get('baseId')] = new OptionPanelView({
        model: model,
        $parent: this.$el,
        controller: this
      })
    }

    if (model.get('type') && model.get('type') === 'static') {
      this.PanelViews.static[model.get('baseId')] = new StaticPanelView({
        model: model,
        $parent: this.$el,
        controller: this
      })
    }
    console.log(this);
  },
  renderRootItem: function () {
    return this.sidebarController.$container.append(tplRootItem('frontend/sidebar/root-item', {
      text: 'Panels',
      id: 'PanelList'
    }))
  }
});