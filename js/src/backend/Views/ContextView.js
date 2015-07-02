var tplContextHeader = require('templates/backend/context-header.hbs');
var ContextBrowser = require('backend/Views/ContextBrowser');
module.exports = Backbone.View.extend({
  initialize: function () {
    this.active = false;
    this.model.View = this;
    this.Areas = this.setupAreas();
    this.GlobalAreas = this.filterGlobalAreas();
    this.AttachedGlobalAreas = this.filterAttachedGlobalAreas();
    this.setupElements();
    this.bindHandlers();
    this.render();
    this.listenTo(KB.Events, 'context.activate', this.activate);
  },
  events: {
    'click .kb-js-add-global-area': 'openBrowser',
    'click .kb-context__header': function () {
      KB.Events.trigger('context.activate', this);
    },
    'click .kb-context-inner--overlay': function () {
      KB.Events.trigger('context.activate', this);
    }
  },
  setupElements: function () {
    this.$header = this.$('.kb-context__header');
    this.$header.append(tplContextHeader({}));
    this.$button = jQuery('.kb-button-small', this.$header);
    this.$inner = this.$('.kb-context__inner');
    this.$overlay = jQuery('<div class="kb-context-inner--overlay"><span>' + this.model.get('title') + '</span><br>click to show</div>');
  },
  render: function () {
    if (!_.isEmpty(this.GlobalAreas)) {
      this.$button.show();
    } else {
      this.$button.hide();
    }
  },
  activate: function (View) {
    if (View.cid === this.cid && !this.active) {
      this.active = true;
      this.trigger('context.activated', this);
      this.$el.addClass('kb-context-focus');
    } else if (this.active && View.cid !== this.cid) {
      this.active = false;
      this.$el.removeClass('kb-context-focus');
      this.trigger('context.deactivated', this);

    }
  },

  setupAreas: function () {
    return KB.Areas.getByContext(this.model.get('id'));
  },
  filterGlobalAreas: function () {
    var collect = {};
    _.each(this.Areas, function (Area) {
      if (Area.get('dynamic') && !Area.get('settings').attached) {
        collect[Area.get('id')] = Area;
      }
    });
    return collect;
  },
  filterAttachedGlobalAreas: function () {
    var collect = {};
    _.each(this.Areas, function (Area) {
      if (Area.get('settings').attached && Area.get('dynamic')) {
        collect[Area.get('id')] = Area;
      }
    });
    return collect;
  },
  bindHandlers: function () {
    var that = this;
    _.each(this.Areas, function (Area) {
      that.listenTo(Area, 'change:settings', that.observeAttachedAreas)
    });
  },
  observeAttachedAreas: function (Area) {
    this.GlobalAreas = this.filterGlobalAreas();
    this.render();
  },
  openBrowser: function () {
    if (!this.Browser) {
      this.Browser = new ContextBrowser({
        Controller: this
      });
    }
    this.Browser.open();
  },
  renderProxy: function(){
    this.$inner.append(this.$overlay);
  },
  removeProxy: function(){
    this.$overlay.detach();
  }

});