var KB = KB || {};

KB.Checks = (function($) {
    return {
        blockLimit: function(areamodel) {
            var limit = areamodel.get('limit');
            // todo potentially wrong
            var children = areamodel.get('assignedModules').length;
            if (limit === 0) {
                return false;
            }

            if (children === limit) {
                return false;
            }

            return true;
        },
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