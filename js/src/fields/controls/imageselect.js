var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      filter:true
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    this.$("[data-kftype='imageselect']").imagepicker(_.extend(this.defaults, this.settings));
  },
  rerender: function () {
    this.$("[data-kftype='imageselect']").imagepicker('destroy');
    this.render();
  }
});