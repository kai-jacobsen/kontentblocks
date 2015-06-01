// KB.Backbone.SidebarView
var Templates = require('common/Templates');
var AreaOverview = require('frontend/Views/Sidebar/AreaOverview/AreaOverviewController');
var CategoryFilter = require('frontend/Views/Sidebar/AreaDetails/CategoryFilter');
var SidebarHeader = require('frontend/Views/Sidebar/SidebarHeader');
var Utilities = require('common/Utilities');
//var RootView = require('frontend/Views/Sidebar/RootView');
module.exports = Backbone.View.extend({
  currentView: null,
  viewStack: [],
  initialize: function () {
    this.render();
    this.states = {};
    var controlsTpl = Templates.render('frontend/sidebar/sidebar-nav', {});
    this.$navControls = jQuery(controlsTpl);
    this.bindHandlers();

    this.states['AreaList'] = new AreaOverview({
      controller: this
    });

    //this.states['PanelList'] = new KB.Backbone.Sidebar.PanelOverview.PanelOverviewController({
    //  controller: this
    //});

    // utility
    this.CategoryFilter = new CategoryFilter();
    //this.setView(this.AreaList);
    //this.setView(this.PanelList);

    //this.RootView = new RootView({
    //  controller: this
    //});
    //this.setView(this.RootView);
    this.setView(this.states['AreaList']); // init Areas list view
  },
  events: {
    'click .kb-js-sidebar-nav-back': 'rootView', // back to level 0
    'click [data-kb-action]': 'actionHandler' // event proxy
  },
  render: function () {
    this.$el = jQuery('<div class="kb-sidebar-wrap" style="display: none;"></div>').appendTo('body');
    this.$toggle = jQuery('<div class="kb-sidebar-wrap--toggle cbutton cbutto-effect--boris"></div>').appendTo('body');
    this.Header = new SidebarHeader({});
    this.$el.append(this.Header.render());
    this.$container = jQuery('<div class="kb-sidebar-wrap__container"></div>').appendTo(this.$el);
    this.$extension = jQuery('<div class="kb-sidebar-extension" style="display: none;"></div>').appendTo(this.$el);
    this.setLayout();

    var ls = Utilities.stex.get('kb-sidebar-visible');
    if (ls) {
      this.toggleSidebar();
    }
  },
  bindHandlers: function () {
    var that = this;
    jQuery(window).resize(function () {
      that.setLayout();
    });

    this.$toggle.on('click', function () {
      that.toggleSidebar();
    });
  },
  setLayout: function () {
    var h = jQuery(window).height();
    var w = this.$el.width();
    this.$el.height(h);
    this.$extension.height(h);
  },
  setExtendedView: function (View) {
    if (this.currentExtendedView) {
      this.currentExtendedView.$el.detach();
    }
    this.currentExtendedView = View;
    this.$extension.html(View.render());
    this.$extension.show();
  },
  closeExtendedView: function () {
    this.currentExtendedView.$el.detach();
    this.currentExtendedView = null;
    this.$extension.html('');
    this.$extension.hide();
  },
  setView: function (View) {
    if (this.currentView) {
      this.currentView.$el.detach();
    }
    this.currentView = View;
    this.viewStack.push(View);
    this.$container.html(View.render());
    this.handleNavigationControls();
  },
  prevView: function () {
    var prev = this.viewStack.shift();
    if (prev) {
      this.setView(prev);
    }
  },
  rootView: function () {
    this.viewStack = []; // empty stack
    this.setView(this.states['AreaList']); // set level 0 view
  },
  handleNavigationControls: function () {
    if (this.viewStack.length >= 2) {
      this.$navControls.prependTo(this.$container);
    } else {
      this.$navControls.detach();
    }
  },
  toggleSidebar: function () {
    this.visible = !this.visible;
    this.$el.fadeToggle();
    jQuery('body').toggleClass('kb-sidebar-visible');
    Utilities.stex.set('kb-sidebar-visible', this.visible, 1000 * 60 * 60);
  },
  actionHandler: function (event) {
    var action = jQuery(event.currentTarget).data('kb-action');
    if (action && this.states[action]) {
      this.setView(this.states[action]);
    }
  }
});