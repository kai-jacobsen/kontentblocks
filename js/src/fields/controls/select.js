var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      sortable: false,
      placeholder: 'Click here to add options'
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    var that = this;
    var settings = _.extend(this.defaults, this.settings);
    if (settings.sortable){
      this.$el.addClass('select-sortable');
      this.$("[data-kbselect2='true']").select2_sortable(settings);
    } else {
      this.$el.removeClass('select-sortable');
      this.$("[data-kbselect2='true']").select2(settings);
    }
    that.$('.select2-search__field').attr('placeholder', settings.placeholder);
    this.$el.on('change', function () {
      that.$('.select2-search__field').attr('placeholder', settings.placeholder);
    })
  },
  rerender: function () {
    this.render();  
  },
  derender: function () {
    var settings = _.extend(this.defaults, this.settings);
    if (settings.sortable){
      this.$("[data-kbselect2='true']").select2_sortable('destroy');
    } else {
      this.$el.removeClass('select-sortable');
      this.$("[data-kbselect2='true']").select2('destroy');
    }
  }
});