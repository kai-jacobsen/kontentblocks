var ListItem = require('backend/Views/TemplateEditor/FieldItem');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  initialize: function (options) {
    this.$container = options.$container;
    this.controller = options.controller;
  },
  render: function () {
    this.$container.empty().append(this.$el);
    this.$el.empty();
    _.each(this.fields, function (v) {
      v.render();
    });
    return this;
  },
  setFields: function (fields) {
    this.fields = this.createViews(fields);
    return this;
  },
  createViews: function (views) {
    return _.map(views, function (listItem) {
      return new ListItem({
        controller: this.controller,
        $list: this.$el,
        model: new Backbone.Model(listItem)
      });
    }, this);
  }

});