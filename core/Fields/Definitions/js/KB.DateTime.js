KB.Fields.register('DateTime', (function($) {
	var settings = {};

	return {
		defaults: {
            format:'d.m.Y H:i',
            inline:false,
            mask: true,
            lang:'de',
            allowBlank: true
		},
		init: function() {
			var that = this;
			_.each($('.kb-datetimepicker'), function(item) {
                var $field = $(item).closest('.kb-field-wrapper');
				var id = $field.attr('id');
                var args = KB.Payload.getFieldArgs(id, 'settings');
				if (id && args) {
					settings = args;
                }

                _.extend(that.defaults, {
                    onChangeDateTime:function(current,$input){
                        $('.kb-datetimepicker--js-unix', $field).val(current.dateFormat('unixtime'));
                        $('.kb-datetimepicker--js-sql', $field).val(current.dateFormat('Y-m-d H:i:s'));

                    }
                });

				$(item).datetimepicker(_.extend(that.defaults, settings));

			});

		},
		update: function() {
			this.init();
		}
	};



}(jQuery)));