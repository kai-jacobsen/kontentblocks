KB.Backbone.Sidebar.AreaDetails.AreaDetailsController = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-list',
  initialize: function (options) {
    this.currentLayout = this.model.get('layout');;
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.categories = this.sidebarController.CategoryFilter.filter(this.model);
    this.Settings = new KB.Backbone.Sidebar.AreaDetails.AreaSettings({
      model: this.model,
      controller: this,
      sidebarController: this.sidebarController
    });
    this.renderHeader();
    this.bindHandlers();
    this.$settingsContainer.append(this.Settings.render());
    this.renderCategories();
  },
  events: {
    'click .kb-sidebar-area-details__cog': 'toggle',
    'click .kb-sidebar-area-details__update' : 'updateAreaSettings'
  },
  bindHandlers: function () {
    this.listenTo(this.model, 'change:layout', this.handleLayoutChange);
  },
  render: function () {
    return this.$el;
  },
  renderHeader: function () {
    this.$el.append(KB.Templates.render('frontend/sidebar/area-details-header', this.model.toJSON()));
    this.$settingsContainer = this.$el.find('.kb-sidebar-area-details__settings');
    this.$updateHandle = this.$el.find('.kb-sidebar-area-details__update').hide();
  },
  renderCategories: function () {
    var that = this;
    _.each(this.categories.toJSON(), function (cat, id) {
      var catView = new KB.Backbone.Sidebar.AreaDetails.CategoryController({
        model: new Backbone.Model(cat),
        controller: that
      });
      that.$el.append(catView.render());
    });
  },
  toggle: function () {
    this.$settingsContainer.slideToggle();
  },
  handleLayoutChange: function () {
      if (this.model.get('layout') !== this.currentLayout){
        this.$updateHandle.show();
      } else {
        this.$updateHandle.hide();
      }
  },
  updateAreaSettings: function () {
    KB.Ajax.send({
      action: 'saveAreaLayout',
      area: this.model.toJSON(),
      layout: this.model.get('layout'),
      _ajax_nonce: KB.Config.getNonce('update')
    }, this.updateSuccess, this);
  },
  updateSuccess: function (res) {
    if (res.status === 200) {
      KB.Notice.notice(res.response, 'success');
    } else {
      KB.Notice.notice('That did not work', 'error');
    }
  }
});