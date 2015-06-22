var BaseView = require('../FieldBaseView');
KB.Fields.registerObject('color', BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'mouseup .kb-field--color': 'recalibrate'
  },
  render: function () {
    this.$(".kb-color-picker").wpColorPicker({});
    jQuery('body').on('click.wpcolorpicker', this.update);
  },
  derender: function () {
    jQuery('body').off('click.wpcolorpicker', this.update);
  },
  update: function () {
    KB.Events.trigger('modal.preview');
  },
  recalibrate: function () {
    _.delay(function () {
      KB.Events.trigger('modal.recalibrate')
    }, 150);
  }
}));