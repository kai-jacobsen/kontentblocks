var tplListItem = require('templates/backend/template-editor/list-item.hbs');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.controller = options.controller;
    this.$list = options.$list
  },
  events: {
    'click': 'loadView'
  },
  render: function () {
    this.$el.append(tplListItem({data: this.model.toJSON()}));
    this.$list.append(this.$el);
  },
  loadView: function () {
    this.controller.load(this)
  },
  select: function () {
    this.$el.addClass('kb-active-template');
  },
  deselect: function () {
    this.$el.removeClass('kb-active-template');
  }
});