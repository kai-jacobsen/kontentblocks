var KB = KB || {};

KB.Fields.Color = (function($) {

	$(document).on('onsite::opened', function() {
		KB.Fields.Color.init();
	});

	return {
		init: function() {

			$(".kb-color-picker").wpColorPicker({
				change: function(event, ui) {
				},
				clear: function() {
					pickColor("");
				}
			});
		}
	};



}(jQuery));
KB.Fields.Color.init();