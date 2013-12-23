var KB = KB || {};

KB.Fields.register('Color', (function($) {



	return {
		init: function() {

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