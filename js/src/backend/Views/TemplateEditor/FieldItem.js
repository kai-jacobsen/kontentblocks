var tplFieldItem = require('templates/backend/template-editor/field-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.$list = options.$list
  },
  render: function () {
    console.log(this.model.toJSON());
    this.$el.append(tplFieldItem({data: this.model.toJSON()}));
    this.$list.append(this.$el);
  }
});