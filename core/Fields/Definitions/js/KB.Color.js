var KB = KB || {};

KB.Fields.Color = (function($) {
	$(document).ready(function() {
		var link_color = $(".kb-color-picker");
		link_color.wpColorPicker({
			change: function(event, ui) {
				console.log(event.target);
				/* pickColor(link_color.wpColorPicker("color"));*/
			},
			clear: function() {
				pickColor("");
			}
		});
	});
}(jQuery));