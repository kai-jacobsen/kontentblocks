var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    this.$textarea.on('change', function () {
      that.update(that.$textarea.val());
    });
  },
  derender: function () {

  },
  update: function (val) {
    this.model.set('value', val);
  }
});