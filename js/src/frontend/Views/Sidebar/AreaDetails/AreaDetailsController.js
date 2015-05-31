//KB.Backbone.Sidebar.AreaDetails.AreaDetailsController
var Templates = require('common/Templates');
var CategoryController = require('frontend/Views/Sidebar/AreaDetails/CategoryController');
var AreaSettings = require('frontend/Views/Sidebar/AreaDetails/AreaSettingsController');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');

module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-list',
  initialize: function (options) {
    this.currentLayout = this.model.get('layout');
    ;
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.categories = this.sidebarController.CategoryFilter.filter(this.model);
    this.Settings = new AreaSettings({
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
    'click .kb-sidebar-action--cog': 'toggle',
    'click .kb-sidebar-action--update': 'updateAreaSettings'
  },
  bindHandlers: function () {
    this.listenTo(this.model, 'change:layout', this.handleLayoutChange);
  },
  render: function () {
    return this.$el;
  },
  renderHeader: function () {
    this.$el.append(Templates.render('frontend/sidebar/area-details-header', this.model.toJSON()));
    this.$settingsContainer = this.$el.find('.kb-sidebar-area-details__settings');
    this.$updateHandle = this.$el.find('.kb-sidebar-action--update').hide();
  },
  renderCategories: function () {
    var that = this;
    _.each(this.categories.toJSON(), function (cat, id) {
      var catView = new CategoryController({
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
    if (this.model.get('layout') !== this.currentLayout) {
      this.$updateHandle.show();
    } else {
      this.$updateHandle.hide();
    }
  },
  updateAreaSettings: function () {
    Ajax.send({
      action: 'saveAreaLayout',
      area: this.model.toJSON(),
      layout: this.model.get('layout'),
      _ajax_nonce: Config.getNonce('update')
    }, this.updateSuccess, this);
  },
  updateSuccess: function (res) {

    if (res.success) {
      Notice.notice(res.message, 'success');
      this.currentLayout = res.data.layout;
      this.model.set('layout', res.data.layout);
      this.handleLayoutChange();
    } else {
      Notice.notice(res.message, 'error');

    }

  }
});