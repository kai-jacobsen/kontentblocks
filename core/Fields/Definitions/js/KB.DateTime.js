var KB = KB || {};

KB.Fields.register('DateTime', (function($) {
	var settings = {};

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
			_.each($('.kb-datetimepicker'), function(item) {
				var id = $(item).closest('.kb-field-wrapper').attr('id');
				if (id) {
					settings = KB.payload.Fields[id] || {};
				}
				$(item).datetimepicker({
                    format:'d.m.Y H:i',
                    inline:false,
                    mask: true,
                    lang:'de',
                    allowBlank: true
                });

			});

		},
		update: function() {
			this.init();
		}
	};



}(jQuery)));