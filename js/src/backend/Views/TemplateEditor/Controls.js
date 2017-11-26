var Update = require('backend/Views/TemplateEditor/controls/UpdateControl');
module.exports = Backbone.View.extend({
  tagName: 'ul',
  className: 'kb-tpl-editor-controls',
  initialize: function (options) {
    this.$container = options.$container;
    this.controller = options.controller;
  },
  render: function () {
    this.$container.empty().append(this.$el);
    this.createControls();
    return this;
  },
  createControls: function () {
    this.$el.append(new Update({controller: this.controller, controls:this}).render());
  }

});