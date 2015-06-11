var BaseView = require('../FieldBaseView');
KB.Fields.registerObject('textarea', BaseView.extend({
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
    // will trigger an change event on the FieldConfigModel and update the module models moduleData accordingly
    this.model.set('value', val);
  }
}));