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
    this.Tether = new Tether({
      element: this.$el,
      target: this.FieldView.$el,
      attachment: 'center right',
      targetAttachment: 'center right'
    });
  },
  getDirty: function(){
    this.$el.addClass('isDirty');
  },
  getClean: function(){
    this.$el.removeClass('isDirty');
  },
  derender: function(){
    if (this.Tether){
      this.Tether.destroy();
    }
  },
  rerender: function(){
    this.createPosition();
  }

});