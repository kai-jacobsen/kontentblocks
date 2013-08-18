/*!
* Iris Color Picker Demo Script
* @author: Rachel Baker ( rachel@rachelbaker.me )
*/(function($) {
    "use strict";
    
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
})(jQuery);