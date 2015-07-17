var Check = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.Parent = options.parent;
    this.$el.append('<span class="dashicons dashicons-edit"></span>');
    if (this.isValid()) {
      this.render();
    }
  },
  className: 'kb-inline-control',
  events: {
    'click': 'focusEditor',
    'mouseenter' : 'mouseenter',
    'mouseleave' : 'mouseleave'
  },
  focusEditor: function (e) {
    this.Parent.activate(e);
  },
  render: function () {
    this.Parent.parentView.$el.append(this.$el);
    this.$el.hide();
  },
  show: function () {
    this.$el.show();
    var off = this.Parent.$el.offset();
    var w = this.Parent.$el.width();
    var h = this.Parent.$el.height();
    off.left = off.left + w - 40;
    off.top = off.top + 3;
    if (h > 30){
      off.top = off.top + 20;
    }
    this.$el.offset(off);
  },
  hide: function () {
    this.$el.hide();
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function(){

  }
});