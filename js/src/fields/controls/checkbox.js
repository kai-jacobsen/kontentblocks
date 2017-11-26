var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$input = this.$('.kb-field--checkbox input');
    this.$input.on('change', function(){
      that.update(that.$input.prop('checked'));
    })
  },
  derender: function () {
    this.$input.off();
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function(){
    return this.$input.val();
  }
});