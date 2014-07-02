KB.Fields.register('Date', (function ($) {
    var settings = {};

    return {
        defaults: {
            format: 'd M Y',
            offset: [0, 250],
            onSelect: function (selected, machine, Date, $el) {
                $('#' + KB.currentFieldId).find('.kb-date-machine-format').val(machine);
                $('#' + KB.currentFieldId).find('.kb-date-unix-format').val(Math.round(Date.getTime() / 1000));
            }
        },
        init: function () {
            var that = this;
            _.each($('.kb-datepicker'), function (item) {
                var id = $(item).closest('.kb-field-wrapper').attr('id');
                if (id && KB.payload.Fields[id].settings) {
                    settings = KB.payload.Fields[id].settings || {};
                }
                $(item).Zebra_DatePicker(_.extend(that.defaults, settings));

            });

        },
        update: function () {
            this.init();
        }
    };


}(jQuery)));