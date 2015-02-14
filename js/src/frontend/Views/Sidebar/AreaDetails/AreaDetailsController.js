KB.Backbone.Sidebar.AreaDetails.AreaDetailsController = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-list',
  initialize: function (options) {
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.categories = this.sidebarController.CategoryFilter.filter(this.model);
    this.Settings = new KB.Backbone.Sidebar.AreaDetails.AreaSettings({
      model: this.model,
      controller: this,
      sidebarController: this.sidebarController
    });
    this.renderHeader();
    this.$settingsContainer.append(this.Settings.render());
    this.renderCategories();
  },
  events: {
    'click .kb-sidebar-area-details__cog' : 'toggle'
  },
  render: function () {
    return this.$el;
  },
  renderHeader: function () {
    this.$el.append(KB.Templates.render('frontend/sidebar/area-details-header', this.model.toJSON()));
    this.$settingsContainer = this.$el.find('.kb-sidebar-area-details__settings');
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
  toggle: function(e){
    this.$settingsContainer.slideToggle();
  }
});