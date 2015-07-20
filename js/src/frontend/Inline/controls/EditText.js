var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-edit"></span>');
    if (this.isValid()) {
      this.render();
    }
    this.listenTo(KB.Events, 'window.change', this.reposition);

  },
  className: 'kb-inline-control',
  events: {
    'click': 'focusEditor',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  focusEditor: function (e) {
    if (_.isNull(this.Parent.editor)){
      this.Parent.activate(e);
    }
  },
  render: function () {
    this.Parent.parentView.$el.append(this.$el);
    this.$el.hide();
  },
  show: function () {
    this.$el.show();
    this.setPosition();
    this.visible = true;

  },
  hide: function () {
    this.$el.hide();
    this.visible = false;

  },
  reposition: function () {
    if (this.visible) {
      this.setPosition();
    }
  },
  setPosition: function () {
    var off = this.Parent.$el.offset();
    var w = this.Parent.$el.width();
    var h = this.Parent.$el.height();
    off.left = off.left + w - 40;
    off.top = off.top + 3;
    if (h > 30) {
      off.top = off.top + 20;
    }
    this.$el.offset(off);
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {

  }
});