var KB = KB || {};

KB.Fields.Date = (function($) {
	var settings = {};
	$(document).on('onsite::opened', function() {
		KB.Fields.Date.init();
	});

	return {
		defaults: {
			format: 'd M Y',
			offset: [0, 250],
			onSelect: function(selected, machine, Date, $el) {
				$(activeField).find('.kb-date-machine-format').val(machine);
				$(activeField).find('.kb-date-unix-format').val(Math.round(Date.getTime() / 1000));
			}
		},
		init: function() {
			var that = this;
			_.each($('.kb-datepicker'), function(item) {
				var id = $(item).closest('.kb-field-wrapper').attr('id');
				if (id) {
					settings = KB.FieldConfig[id] || {};
				}
				console.log(_.extend(that.defaults, settings));
				$(item).Zebra_DatePicker(_.extend(that.defaults, settings));

			});

		}
	};



}(jQuery));
KB.Fields.Date.init();