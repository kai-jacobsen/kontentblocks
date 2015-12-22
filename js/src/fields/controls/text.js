var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$input = this.$('.kb-field--text input');
    this.$input.on('change', function(){
      that.update(that.$input.val());
    })
  },
  derender: function () {

  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function(){
    return this.$input.val();
  }
});