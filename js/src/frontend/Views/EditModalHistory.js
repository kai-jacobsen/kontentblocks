var Stack = require('common/Stack');
module.exports = Backbone.View.extend({
  events: {
    'click': 'goBack'
  },
  initialize: function (options) {
    this.stack = new Stack();
    this.modal = options.modal;
    this.setElement(this.modal.$('.kb-modal-history-back'));
    this.render();
  },
  append: function (view) {
    this.stack.append(view);
    this.render();
  },
  prepend: function (view) {
    this.stack.prepend(view);
    this.render();
  },
  reset: function () {
    this.stack.reset();
    this.render();
  },
  render: function () {
    if (this.stack.length() > 0) {
      this.$el.show();
    } else {
      this.$el.hide();
    }
  },
  goBack: function () {
    this.modal.openView(this.stack.first(), false, false);
    this.render();
  }

});