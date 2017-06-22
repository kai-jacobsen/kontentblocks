var ListItem = require('backend/Views/TemplateEditor/ListItem');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  initialize: function (options) {
    this.$container = options.$container;
    this.controller = options.controller;
    this.views = this.createViews(options.views);
  },
  render: function () {
    this.$container.empty().append(this.$el);
    _.each(this.views, function (v) {
      v.render();
    });
    return this;
  },
  getActiveView: function () {
    return _.find(this.views, function (view) {
      return view.model.get('isActive');
    })
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