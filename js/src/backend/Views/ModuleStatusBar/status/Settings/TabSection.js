module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.sectionId = options.sectionId;
    this.containerId = options.containerId;
    this.fields = {};
  },
  addField: function (view) {
    if (!this.fields[view.bindId]) {
      this.fields[view.bindId] = view;
    }
    this.$el.append(view.render());
  }

});