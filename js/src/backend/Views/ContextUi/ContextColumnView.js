module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.Controller = options.Controller;
    this.ContextsViews = this.setupContextsViews();
    this.isVisible = true;
    this.listenTo(this.Controller, 'columns.rendered', this.columnActivated);
    this.listenTo(this.Controller, 'columns.reset', this.reset);
  },
  setupContextsViews: function () {
    var coll = {};
    var that = this;
    var $wraps = this.$('.kb-context-container');

    _.each($wraps, function (el, index) {
      var context = el.dataset.kbcontext;
      var Model = KB.Contexts.get(context);
      coll[Model.View.cid] = Model.View;
      Model.View.isVisible = true;
      Model.View.ColumnView = that;
      that.listenTo(Model.View, 'context.activated', that.activateColumn);
    });
    return coll;
  },
  activateColumn: function () {
    this.trigger('column.activate', this);
  },
  columnActivated: function(View){
    if (View.cid !== this.cid){
      _.each(this.ContextsViews, function(con){
        con.renderProxy();
      });
    } else {
      _.each(this.ContextsViews, function(con){
        con.removeProxy();
      });
    }
  },
  reset: function(){
    _.each(this.ContextsViews, function(con){
      con.removeProxy();
    });
  }


});