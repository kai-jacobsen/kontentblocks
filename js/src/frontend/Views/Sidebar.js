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
    this.$el = jQuery('<div class="kb-sidebar-wrap" style="display: none;"></div>').appendTo('body');
    this.$toggle = jQuery('<div class="kb-sidebar-wrap--toggle cbutton cbutto-effect--boris"></div>').appendTo('body');
    this.Header = new KB.Backbone.Sidebar.Header({});
    this.$el.append(this.Header.render());
    this.$container = jQuery('<div class="kb-sidebar-wrap__container"></div>').appendTo(this.$el);
    this.setLayout();
  },
  bindHandlers: function () {
    var that = this;
    jQuery(window).resize(function () {
      that.setLayout();
    });

    this.$toggle.on('click', function(){
      that.toggleSidebar();
    });
  },
  setLayout: function () {
    var h = jQuery(window).height();
    this.$el.height(h);

    var ls = KB.Util.stex.get('kb-sidebar-visible');
    if (ls){
      this.toggleSidebar();
    }

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
    this.setView(this.AreaList);
  },
  handleNavigationControls: function () {
    if (this.viewStack.length >= 2) {
      this.$navControls.prependTo(this.$container);
    } else {
      this.$navControls.detach();
    }
  },
  toggleSidebar: function(){
    this.visible = !this.visible;
    this.$el.fadeToggle();
    jQuery('body').toggleClass('kb-sidebar-visible');
    KB.Util.stex.set('kb-sidebar-visible', this.visible, 1000*60*60);
  }
});