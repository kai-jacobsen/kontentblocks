var KB = KB || {};

KB.Fields.register('Color', (function($) {
	return {
		init: function() {
            $('body').on('mouseup', '.kb_field.color', function(){
                setTimeout(function(){
                    if (KB.FrontendEditModal){
                        KB.FrontendEditModal.recalibrate();
                    }
                },75);

            });

			$(".kb-color-picker").wpColorPicker({

				change: function(event, ui) {
				},
				clear: function() {
					pickColor("");
				}
			});
		},
		update: function() {
			this.init();
		}
	};
}(jQuery)));

