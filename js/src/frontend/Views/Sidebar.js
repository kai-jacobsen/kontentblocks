KB.Backbone.SidebarView = Backbone.View.extend({
  currentView: null,
  viewStack: [],
  initialize: function () {
    this.render();
    this.states = {};
    var controlsTpl = KB.Templates.render('frontend/sidebar/sidebar-nav', {});
    this.$navControls = jQuery(controlsTpl);
    this.bindHandlers();

    this.states['AreaList'] = new KB.Backbone.Sidebar.AreaOverview.AreaOverviewController({
      controller: this
    });

    //this.states['PanelList'] = new KB.Backbone.Sidebar.PanelOverview.PanelOverviewController({
    //  controller: this
    //});

    // utility
    this.CategoryFilter = new KB.Backbone.Sidebar.CategoryFilter();
    //this.setView(this.AreaList);
    //this.setView(this.PanelList);

    this.RootView = new KB.Backbone.Sidebar.RootView({
      controller: this
    });
    this.setView(this.RootView);
  },
  events: {
    'click .kb-js-sidebar-nav-back': 'rootView',
    'click [data-kb-action]': 'actionHandler'
  },
  render: function () {
    this.$el = jQuery('<div class="kb-sidebar-wrap" style="display: none;"></div>').appendTo('body');
    this.$toggle = jQuery('<div class="kb-sidebar-wrap--toggle cbutton cbutto-effect--boris"></div>').appendTo('body');
    this.Header = new KB.Backbone.Sidebar.Header({});
    this.$el.append(this.Header.render());
    this.$container = jQuery('<div class="kb-sidebar-wrap__container"></div>').appendTo(this.$el);
    this.$extension = jQuery('<div class="kb-sidebar-extension" style="display: none;"></div>').appendTo(this.$el);
    this.setLayout();

    var ls = KB.Util.stex.get('kb-sidebar-visible');
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
    this.viewStack = [];
    this.setView(this.RootView);
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
    KB.Util.stex.set('kb-sidebar-visible', this.visible, 1000 * 60 * 60);
  },
  actionHandler: function (event) {
    var action = jQuery(event.currentTarget).data('kb-action');
    if (action && this.states[action]) {
      this.setView(this.states[action]);
    }

  }
});