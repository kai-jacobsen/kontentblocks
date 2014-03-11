KB.Checks = (function($) {
    return {
        blockLimit: function(areamodel) {
            var limit = areamodel.get('limit');
            // todo potentially wrong, yeah it's wrong
            var children = $('#' + areamodel.get('id') + ' li.kb_block').length;

            if (limit !== 0 && children === limit) {
                console.log('asdf');
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