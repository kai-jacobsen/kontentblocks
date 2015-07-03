var tplContextBar = require('templates/backend/context-bar.hbs');
var ContextUiView = require('backend/Views/ContextUi/ContextUiView');
var ContextColumnView = require('backend/Views/ContextUi/ContextColumnView');
var ResetControl = require('backend/Views/ContextUi/controls/ResetControl');
var ColumnControl = require('backend/Views/ContextUi/controls/ColumnControl');
module.exports = Backbone.View.extend({
  initialize: function () {
    var that = this;
    this.columns = this.setupColumns();
    this.layoutBackup = this.createLayoutBackup();
    this.cols = _.toArray(this.columns).length;
    this.render();

    jQuery(window).resize(function () {
      that.resetLayout();
    })
  },
  setupColumns: function () {
    var that = this;
    var cols = this.$('.kb-context-col');
    return _.map(cols, function (el) {
      var View = new ContextColumnView({
        el: el,
        Controller: that
      });
      that.listenTo(View, 'activate.column', that.evalLayout);
      return View;
    });
  },
  render: function () {
    //if (this.cols > 2) {
      var $bar = jQuery(tplContextBar({}));
      this.$el.before($bar);
      this.BarView = new ContextUiView({
        el: $bar
      });
      this.setupMenuItems();
    //}
  },
  setupMenuItems: function () {
    var that = this;
    this.BarView.addItem(new ResetControl({model: this.model, parent: this}));
    _.each(this.columns, function (con) {
      that.BarView.addItem(new ColumnControl({model: that.model, parent: that, ColumnView: con}));
    });
  },
  createLayoutBackup: function () {
    var coll = {};
    _.each(this.columns, function (con, i) {
      coll[i] = con.$el.attr('class');
    });
    return coll;
  },
  resetLayout: function () {
    var that = this;
    _.each(this.columns, function (con) {
      if (!con.isVisible) {
        con.Control.switch();
      }
      con.$el.attr('class', that.layoutBackup[con.cid]);
      con.$el.width('');
    });
  },
  evalLayout: function (View) {
    var that = this;
    var w = this.$el.width() - ((this.cols) * 20);
    var pro = this.findProportion(this.cols);

    if ( w < 1100){
      return false;
    }

    _.each(this.columns, function (con) {
      if (con.cid === View.cid) {
        con.$el.width(Math.floor(w * pro.large));
        //con.$el.removeClass('kb-context-downsized');
      } else {
        con.$el.width(Math.floor(w * pro.small));
        //con.$el.addClass('kb-context-downsized');
        //  con.renderProxy();
      }
    })
  },
  renderLayout: function () {
    var visible = _.filter(this.columns, function (con) {
      return con.isVisible;
    });
    var l = visible.length;
    var w = this.$el.width() - ((l) * 20);
    _.each(visible, function (con) {
      con.$el.width(Math.floor(w * ((100 / l) / 100)));
    });
  },
  findProportion: function (l) {
    switch (l) {
      case 3:
        return {small: 0.1, large: 0.8};
        break;
      case 2:
        return {small: 0.3333, large: 0.6666};
        break;

      default:
        return {small: 1, large: 1};
        break;
    }
  }
});

