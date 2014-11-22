/**
 * Single module nav item
 * model refers to the parent view and is an actual Backbone View
 */
KB.Backbone.ModuleMenuItem = Backbone.View.extend({
  initialize: function () {
    var that = this;
    this.parentView = this.model;
    // this.model refers to the moduleView
    this.el = KB.Templates.render('frontend/module-menu-item', {
      view: this.parentView.model.toJSON()
    });
    this.$el = jQuery(this.el);

    this.parentView.controlView = this;

    jQuery(window).scroll(function () {
      if (that.parentView.$el.visible(true, true)) {
        that.$el.addClass('in-viewport');
        that.$el.show(250);
      } else {
        that.$el.removeClass('in-viewport');
        that.$el.hide(250);
      }
    });

    this.parentView.$el.on('mouseenter', function () {
      that.$el.addClass('in-viewport-active');
    });

    this.parentView.$el.on('mouseleave', function () {
      that.$el.removeClass('in-viewport-active');
    });

  },
  events: {
    'mouseenter': 'over',
    'mouseleave': 'out',
    "click": 'scrollTo',
    "click .kb-menubar-item__edit": "openControls",
    'click .kb-js-inline-update': 'inlineUpdate'
  },
  render: function () {
    return this.$el;
  },
  over: function () {
    this.parentView.$el.addClass('kb-menubar-active');
  },
  out: function () {
    this.parentView.$el.removeClass('kb-menubar-active');
  },
  openControls: function (e) {
    e.stopPropagation();
    this.parentView.openOptions();
  },
  inlineUpdate: function (e) {
    e.stopPropagation();
    this.parentView.updateModule();
    this.parentView.getClean();
  },
  scrollTo: function () {
    var that = this;
    jQuery('html, body').animate({
      scrollTop: that.parentView.$el.offset().top - 100
    }, 750);
  }

});

/**
 * Single area item
 * model refers to the parent view and is an actual Backbone View
 */
KB.Backbone.AreaNavItem = Backbone.View.extend({

  events: {
    'mouseenter': 'over',
    'mouseleave': 'out',
    'click .kb-menubar-item__edit': 'openAreaSettings',
    'click .kb-menubar-item__update': 'updateAreaSettings'
  },
  initialize: function () {
    this.parentView = this.model;
    // this.model refers to the moduleView
    this.el = KB.Templates.render('frontend/area-menu-item', {
      view: this.parentView.model.toJSON()
    });
    this.$el = jQuery(this.el);

    this.parentView.controlView = this;

  },
  render: function () {
    return this.$el;
  },
  over: function () {
    this.parentView.$el.addClass('kb-menubar-area-active');
  },
  out: function () {
    this.parentView.$el.removeClass('kb-menubar-area-active');

  },
  openAreaSettings: function (e) {
    if (KB.EditModalAreas) {
      KB.EditModalAreas.
        setArea(this.model).
        setModel(this.model.model);
      KB.EditModalAreas.render();
      return this;
    }

    KB.EditModalAreas = new KB.Backbone.EditModalAreas({
      model: this.model.model,
      target: e.currentTarget,
      AreaView: this.model
    });

  },
  updateAreaSettings: function () {
    KB.Ajax.send({
      action: 'saveAreaLayout',
      area: this.model.model.toJSON(),
      layout: this.model.Layout.model.get('layout'),
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


/**
 * Main view/controller for the bottom menubar
 */
KB.Backbone.MenubarView = Backbone.View.extend({
  subviews: [],
  tagName: 'div',
  className: 'kb-menubar-container',
  initialize: function () {
    // get or set show state to local storage
    this.$title = jQuery('<div class="kb-module-controls__title"> </div>').appendTo(this.$el);
    this.show = _.isNull(KB.Util.stex.get('kb-nav-show')) ? true : KB.Util.stex.get('kb-nav-show');
    this.$toggle = jQuery('<div class="kb-menubar-toggle genericon genericon-menu"></div>').appendTo(this.$el);
    this.$modulesTab = jQuery('<div data-list="modules" class="kb-menubar-tab kb-menubar-tab__modules kb-tab-active">Modules</div>').appendTo(this.$title);
    this.$areasTab = jQuery('<div data-list="areas" class="kb-menubar-tab kb-menubar-tab__areas">Areas</div>').appendTo(this.$title);

    this.StatusBar = new KB.Backbone.Frontend.StatusBar({
      el: this.$title
    });

    this.render();
  },
  events: {
    'click .kb-menubar-toggle': 'toggleView',
    'mouseenter .kb-menubar-toggle': 'over',
    'mouseleave .kb-menubar-toggle': 'out',
    'click .kb-menubar-tab': 'switchTabs'
  },
  render: function () {
    this.$el.appendTo('body');
    this.$modulesList = jQuery('<ul class="kb-menubar__modules"></ul>').appendTo(this.$el);
    this.$areasList = jQuery('<ul class="kb-menubar__areas"></ul>').appendTo(this.$el);
    this.$areasList.hide();
    if (this.show) {
      this.$el.addClass('kb-menubar-show');
    }

  },
  attachModuleView: function (moduleView) {
    moduleView.Menubar = this;
    this.renderModuleViewItem(moduleView);
  },
  renderModuleViewItem: function (moduleView) {
    var Item = new KB.Backbone.ModuleMenuItem({
      model: moduleView
    });
    this.$modulesList.append(Item.render());
  },
  attachAreaView: function (areaView) {
    areaView.Menubar = this;
    this.renderAreaViewItem(areaView);
  },
  renderAreaViewItem: function (areaView) {
    var Item = new KB.Backbone.AreaNavItem({
      model: areaView
    });
    this.$areasList.append(Item.render());
  },
  toggleView: function () {
    this.$el.toggleClass('kb-menubar-show');
    this.$el.removeClass('kb-menubar-show-partly');
    var show = !this.show;
    this.show = show;
    KB.Util.stex.set('kb-menubar-show', show, 60 * 60 * 1000 * 24);
  },
  over: function () {
    if (!this.show) {
      this.$el.addClass('kb-menubar-show-partly');
    }
  },
  out: function () {
    if (!this.show) {
      this.$el.removeClass('kb-menubar-show-partly');
    }
  },
  switchTabs: function (e) {
    var $targetEl, targetList;
    $targetEl = jQuery(e.currentTarget);
    jQuery('.kb-tab-active').removeClass('kb-tab-active');
    targetList = $targetEl.data('list');
    $targetEl.addClass('kb-tab-active');

    if (targetList === 'areas') {
      this.$modulesList.hide();
      this.$areasList.show();
    } else {
      this.$modulesList.show();
      this.$areasList.hide();
    }
    jQuery(window).trigger('scroll');
  }


});