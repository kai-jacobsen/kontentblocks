var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    this.editor = new MediumEditor(this.$('.kb-medium-editable'));
  },
  derender: function () {

  },
  update: function (val) {
  },
  toString: function(){
  }
});