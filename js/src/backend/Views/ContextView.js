var tplContextHeader = require('templates/backend/context-header.hbs');
var ContextBrowser = require('backend/Views/ContextBrowser');
module.exports = Backbone.View.extend({
  initialize: function () {
    this.Areas = this.setupAreas();
    this.GlobalAreas = this.filterGlobalAreas();
    this.AttachedGlobalAreas = this.filterAttachedGlobalAreas();
    this.setupElements();
    this.bindHandlers();
    this.render();
  },
  events: {
    'click .kb-js-add-global-area': 'openBrowser'
  },
  render: function () {
    if (!_.isEmpty(this.GlobalAreas)) {
      this.$button.show();
    } else {
      this.$button.hide();
    }
  },
  setupElements: function () {
    this.$header = this.$('.kb-context__header');
    this.$header.append(tplContextHeader({}));
    this.$button = jQuery('.kb-button-small', this.$header);
    this.$inner = this.$('.kb-context__inner');
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
  }
});