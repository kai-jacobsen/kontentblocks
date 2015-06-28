var ContextAreaView = require('backend/Views/ContextBrowserAreaView');
var tplContextBrowser = require('templates/backend/context-browser.hbs');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-global-areas-browser-wrap base-box-border base-box-shadow',
  initialize: function (options) {
    this.isOpen = false;
    this.Controller = options.Controller;
    this.subViews = this.setupViews();
    this.setupElements();
    this.render();
    this.open();
  },
  events:{
      'click .close-browser' : 'close'
  },
  render: function () {
    var that = this;
    this.$list.empty();
    _.each(this.subViews, function (View) {
      var html = View.render();
      if (html) {
        that.$list.append(html);
      }
    });
  },
  setupElements: function () {
    this.$backdrop = jQuery("<div class='kb-global-areas-backdrop'></div>");
    this.$el.append(tplContextBrowser());
    this.$list = this.$(".kb-global-areas-list");
  },
  open: function () {
    this.$backdrop.appendTo('body');
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$el.appendTo('body');
  },
  close: function () {
    this.$backdrop.detach();
    jQuery('#wpwrap').removeClass('module-browser-open');

    this.$el.detach();
  },
  setupViews: function () {
    var that = this;
    var Areas = this.Controller.GlobalAreas;
    return _.map(Areas, function (Area) {
      return new ContextAreaView({
        model: Area,
        Browser: that
      })
    });
  }
});