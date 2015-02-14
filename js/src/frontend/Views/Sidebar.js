KB.Backbone.SidebarView = Backbone.View.extend({
  currentView: null,
  viewStack: [],
  initialize: function () {
    this.render();
    var controlsTpl = KB.Templates.render('frontend/sidebar/sidebar-nav', {});
    this.$navControls = jQuery(controlsTpl);
    this.bindHandlers();
    this.AreaList = new KB.Backbone.Sidebar.AreaOverview.AreaOverviewController({
      controller: this
    });
    this.CategoryFilter = new KB.Backbone.Sidebar.CategoryFilter();
    this.setView(this.AreaList);

  },
  events: {
    'click .kb-js-sidebar-nav-back': 'rootView'
  },
  render: function () {
    this.$el = jQuery('<div class="kb-sidebar-wrap"></div>').appendTo('body');
    this.setLayout();
  },
  bindHandlers: function () {
    var that = this;
    jQuery(window).resize(function () {
      that.setLayout();
    });
  },
  setLayout: function () {
    var h = jQuery(window).height();
    this.$el.height(h);
  },
  setView: function (View) {

    if (this.currentView) {
      this.currentView.$el.detach();
    }
    this.currentView = View;
    this.viewStack.push(View);
    this.$el.html(View.render());
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
    this.setView(this.AreaList);

  },
  handleNavigationControls: function () {
    if (this.viewStack.length >= 2) {
      this.$navControls.prependTo(this.$el);
    } else {
      this.$navControls.detach();
    }
  }
});