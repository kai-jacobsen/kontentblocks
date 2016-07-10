var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    this.$("[data-kbselect2='true']").select2(_.extend(this.defaults, this.settings));
  },
  rerender: function () {
    this.render();  
  }
});