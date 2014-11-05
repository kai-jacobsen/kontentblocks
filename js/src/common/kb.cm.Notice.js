KB.Notice = (function($) {
	'use strict';

    return {
        notice: function(msg, type) {
            alertify.log(msg, type, 3500);
        },
        confirm: function(msg, yes, no, scope) {
            alertify.confirm(msg, function(e) {
                if (e) {
                    yes.call(scope);
                } else {
                    no.call(scope);
                }
            });
        }
    };

}(jQuery));