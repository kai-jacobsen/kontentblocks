KB.Fields.register('OpeningTimes', (function ($) {
  return {
    init: function (modalView) {
      // find all instances on load
      $('.otimes-field--stage', $('body')).each(function (index, el) {
        var $el = $(el);

        $('.kb-ot-timepicker', $el).datetimepicker({
          datepicker: false,
          format: 'H:i',
          validateOnBlur: false
        });
      });

      $('.js-oday-activate-split').on('click', function () {
        $(this).parent().find('table').toggleClass('split');
      });
    },
    update: function () {
      this.init();
    },
    frontUpdate: function (modalView) {
      this.init(modalView);
    }
  };
}(jQuery)));
