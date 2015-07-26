var Tether = require('tether');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-inline-toolbar',
  attributes: function () {
    return {
      'data-kbelrel': this.model.get('baseId'),
      'hidefocus': '1',
      'tabindex': '-1'
    };
  },
  initialize: function (options) {
    this.options = options;
    this.FieldView = options.FieldView;
    this.controls = options.controls || [];

    this.listenTo(this.model, 'field.model.dirty', this.getDirty);
    this.listenTo(this.model, 'field.model.clean', this.getClean);
    this.listenTo(this.FieldView, 'field.view.derender', this.derender);
    this.listenTo(this.FieldView, 'field.view.rerender', this.rerender);
    this.create();
  },
  create: function () {
    var that = this;
    _.each(this.controls, function (control) {
      control.$el.appendTo(that.$el);
      control.Toolbar = that;
    });
    this.$el.appendTo('body');
    this.createPosition();
  },
  createPosition: function () {
    var tether = this.options.tether || {};
    var settings = {
      element: this.$el,
      target: this.FieldView.$el,
      attachment: 'center right',
      targetAttachment: 'center right'
    };
    this.Tether = new Tether(
      _.defaults(settings, tether)
    );
  },
  getDirty: function () {
    this.$el.addClass('isDirty');
  },
  getClean: function () {
    this.$el.removeClass('isDirty');
  },
  derender: function () {
    if (this.Tether) {
      this.Tether.destroy();
      delete this.Tether;
    }
  },
  rerender: function () {
    this.createPosition();
  },
  getTetherDefaults: function () {
    var att = this.el;
    var target = this.FieldView.el;
    return _.defaults(tether, {
      element: att,
      target: target,
      attachment: 'center right',
      targetAttachment: 'center right'
    });
  }

});