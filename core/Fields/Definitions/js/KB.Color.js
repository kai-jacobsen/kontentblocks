var KB = KB || {};

KB.Fields.register('Color', (function($) {
	return {
		init: function() {
            _K.log('Color init', $(".kb-color-picker"));
            $('body').on('mouseup', '.kb-field--color', function(){
                setTimeout(function(){
                    if (KB.FrontendEditModal){
                        KB.FrontendEditModal.recalibrate();
                    }
                }, 150);

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
		},
        frontUpdate: function(view){
            console.log(view);
            this.init();
        }

	};
}(jQuery)));

