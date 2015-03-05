KB.Backbone.Sidebar.RootView = Backbone.View.extend({
  initialize: function (options) {
    this.Controller = options.controller
  },
  render: function () {
    _.each(this.Controller.states, function (state) {
      state.renderRootItem();
    });
  }
});