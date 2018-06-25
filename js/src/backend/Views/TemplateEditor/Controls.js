var Update = require('backend/Views/TemplateEditor/controls/UpdateControl');
var Create = require('backend/Views/TemplateEditor/controls/CreateControl');
var Duplicate = require('backend/Views/TemplateEditor/controls/DuplicateControl');
var Feedback = require('backend/Views/TemplateEditor/controls/FeedbackControl');
var Delete = require('backend/Views/TemplateEditor/controls/DeleteControl');
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
    this.$el.append(new Create({controller: this.controller, controls:this}).render());
    this.$el.append(new Duplicate({controller: this.controller, controls:this}).render());
    this.$el.append(new Delete({controller: this.controller, controls:this}).render());
    this.$el.append(new Feedback({controller: this.controller, controls:this}).render());
  }


});