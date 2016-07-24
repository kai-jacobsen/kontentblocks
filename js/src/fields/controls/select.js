var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      sortable: true
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    var settings = _.extend(this.defaults, this.settings);
    if (settings.sortable){
      this.$("[data-kbselect2='true']").select2_sortable(settings);
    } else {
      this.$("[data-kbselect2='true']").select2(settings);
    }
  },
  rerender: function () {
    this.render();  
  }
});