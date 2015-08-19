var BaseView = require('../FieldBaseView');
module.exports = BaseView.extend({
  events: {
    'click .js-oday-activate-split' : 'split'
  },
  initialize: function () {
    console.log('this');
    this.render();
  },
  render:function(){
    this.$('.kb-ot-timepicker').datetimepicker({
      datepicker: false,
      format: 'H:i',
      validateOnBlur: true,
      step: 30,
      mask:'29:59'
    });
  },
  derender: function(){
    this.$('.kb-ot-timepicker').datetimepicker('destroy');
  },
  split:function(){
    this.$('table').toggleClass('split');
  }
});

