var ModuleListItem = require('frontend/Views/Sidebar/AreaOverview/ModuleListItem');
var AreaDetailsController = require('frontend/Views/Sidebar/AreaDetails/AreaDetailsController');
var tplEmptyArea = require('templates/frontend/sidebar/empty-area.hbs');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  className: 'kb-sidebar-areaview__modules-list',
  ModuleViews: {},
  initialize: function (options) {
    this.Modules = new Backbone.Collection();
    this.$parent = options.$el; // skelton as inserted by controller
    this.controller = options.controller;
    this.sidebarController = options.sidebarController;
    this.$toggleHandle = this.$parent.find('.kb-sidebar-areaview__title');
    this.ModuleList = new AreaDetailsController({
      controller: options.controller,
      sidebarController: options.sidebarController,
      model: this.model
    });
    this.render();
    this.bindHandlers();
  },

  render: function () {
    this.$el.appendTo(this.$parent).hide();
  },
  bindHandlers: function () {
    var that = this;
    this.listenTo(this.Modules, 'add', this.renderModuleItem);
    this.listenTo(this.model, 'area.resorted', this.resortViews);

    this.$toggleHandle.on('click', function () {
      that.controller.setActiveList(that);
    });
    this.$parent.on('click', '.kb-js-sidebar-add-module', function () {
      that.sidebarController.setView(that.ModuleList);
    });

    this.listenToOnce(KB.Events, 'frontend.init', this.afterInit);
  },
  activate: function () {
    this.$parent.removeClass('kb-sidebar-areaview--inactive');
    this.model.View.$el.addClass('kb-in-sidebar-active');
  },
  deactivate: function () {
    this.$parent.addClass('kb-sidebar-areaview--inactive');
    this.model.View.$el.removeClass('kb-in-sidebar-active');

  },
  renderModuleItem: function (model) {
    this.ModuleViews[model.id] = View = new ModuleListItem({
      $parent: this.$el,
      model: model
    });
    View.$el.appendTo(this.$el);
  },
  /**
   *
   * @param moduleView original base view of the module
   * - $el refers to the DOM node
   */
  attachModuleView: function (moduleView) {
    this.Modules.add(moduleView.model);
    this.listenToOnce(moduleView.model, 'remove', this.removeModuleView);
  },
  /**
   * Original / base module model
   * @param moduleModel
   */
  removeModuleView: function (moduleModel) {
    // sidebar list item view
    var sidebarView = this.ModuleViews[moduleModel.id];
    this.Modules.remove(moduleModel);
    delete this.ModuleViews[moduleModel.id];
    sidebarView.dispose();
  },
  afterInit: function () {
    if (this.Modules.models.length === 0 && this.model.View.$el.is(":visible")) {
      this.$el.append(tplEmptyArea({}));
    }
  },
  moduleOrder: function () {
    var $domEl = this.model.View.$el;
    var modules = jQuery("[id^=module]", $domEl);
    return _.pluck(modules, 'id');
  },
  resortViews: function(){
    var that = this;
    var order = this.moduleOrder().reverse();
    _.each(order, function(id){
      var v = that.ModuleViews[id];
      v.$el.detach();
      v.$el.prependTo(that.$el);
    });

  }
});