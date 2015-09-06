var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  events: {
    'click .js-oday-activate-split' : 'split'
  },
  initialize: function () {
    this.render();
  },
  render:function(){
    this.$('.kb-ot-timepicker').datetimepicker({
      datepicker: false,
      format: 'H:i',
      validateOnBlur: false,
      step: 30
    });
  },
  derender: function(){
    this.$('.kb-ot-timepicker').datetimepicker('destroy');
  },
  split:function(){
    this.$('table').toggleClass('split');
  }
});

