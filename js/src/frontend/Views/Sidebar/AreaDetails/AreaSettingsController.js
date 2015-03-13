KB.Backbone.Sidebar.AreaDetails.AreaSettings = Backbone.View.extend({
  tagName: 'ul',
  className: 'kb-sidebar-area-details__templates',
  LayoutDefs: KB.Payload.getPayload('AreaTemplates') || {},
  events: {
    'click li': 'layoutSelect'
  },
  initialize: function (options) {
    this.controller = options.controller;
    this.sidebarController = options.SidebarController;
    this.setOptions();
  },
  render: function () {
    return this.$el;
  },
  layoutSelect: function (e) {
    var $li = jQuery(e.currentTarget);
    this.$el.find('.kb-active-area-layout').removeClass();
    $li.addClass('kb-active-area-layout');
    this.model.View.changeLayout($li.data('item'));
    this.model.set('layout', $li.data('item'));
  },
  setOptions: function () {
    var options = '';
    var layouts = this.model.get('layouts');
    if (layouts && layouts.length > 0) {
      this.$el.prepend('<div class="kb-sidebar__subheader">Layouts</div>');
      _.each(this.prepareLayouts(layouts), function (item) {
        options += KB.Templates.render('frontend/area-layout-item', {
          item: item
        });
      });
      this.$el.append(options);
    }
  },
  prepareLayouts: function (layouts) {
    var that = this;

    var stored = this.model.get('layout');
    return _.map(layouts, function (l) {
      if (that.LayoutDefs[l]) {
        var def = that.LayoutDefs[l];
        if (def.id === stored) {
          def.currentClass = 'kb-active-area-layout';
        } else {
          def.currentClass = '';
        }
        return def;
      }
    });
  }

});
