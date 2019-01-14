var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  events: {
    'click .js-oday-activate-split' : 'split',
    'click input[type=checkbox]' : 'toggleClosed'
  },
  initialize: function () {
    this.render();
  },
  toggleClosed: function(){
    var $trs = this.$('tr');
    jQuery.each($trs, function (i, el) {
      var $el = jQuery(el);
      var $cb = jQuery('input[type=checkbox]', $el);
      if ($cb.is(':checked')){
        $el.find('input[type=text]:not(.ot-label)').attr('disabled', 'disabled');
      } else {
        $el.find('input[type=text]:not(.ot-label)').removeAttr('disabled','');
      }
    })
  },
  render:function(){
    this.$('.kb-ot-timepicker').kbdatetimepicker({
      datepicker: false,
      format: 'H:i',
      validateOnBlur: false,
      step: 30
    });
    this.toggleClosed();
  },
  derender: function(){
    this.$('.kb-ot-timepicker').kbdatetimepicker('destroy');
  },
  split:function(){
    this.$('table').toggleClass('split');
  }
});

