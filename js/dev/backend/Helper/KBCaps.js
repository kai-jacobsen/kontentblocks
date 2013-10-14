'use strict';

var KB = KB || {};

KB.Caps = (function($) {

    return {
        userCan: function(cap) {
            var check = $.inArray(cap, kontentblocks.caps);
            if (check !== -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    };

}(jQuery));