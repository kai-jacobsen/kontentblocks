//KB.Backbone.Sidebar.AreaDetails.AreaDetailsController
var CategoryController = require('frontend/Views/Sidebar/AreaDetails/CategoryController');
// var AreaSettings = require('frontend/Views/Sidebar/AreaDetails/AreaSettingsController');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');

var tplAreaDetailsHeader = require('templates/frontend/sidebar/area-details-header.hbs');

//noinspection JSUnusedGlobalSymbols
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-sidebar__module-list',
  initialize: function (options) {
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.categories = this.sidebarController.CategoryFilter.filter(this.model);
    this.renderHeader();
    this.renderCategories();
  },
  events: {
    'click .kb-sidebar-action--cog': 'toggle',
    'click .kb-sidebar-action--update': 'updateAreaSettings'
  },
  render: function () {
    return this.$el;
  },
  renderHeader: function () {
    this.$el.append(tplAreaDetailsHeader(this.model.toJSON()));
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
  }
});