KB.Ajax = (function($) {

    return {
        send: function(data, callback, scope) {
            var pid = (KB.Screen && KB.Screen.post_id) ? KB.Screen.post_id : false;
            var sned = _.extend( {
                supplemental: data.supplemental || {},
            count: parseInt($('#kb_all_blocks').val(), 10),
            nonce: $('#_kontentblocks_ajax_nonce').val(),
            post_id: pid,
            kbajax: true
            }, data);

            $('#publish').attr('disabled', 'disabled');

            return $.ajax({
                url: ajaxurl,
                data: sned,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        if (scope && callback){
                            callback.call(scope, data);
                        } else if (callback) {
                            callback(data);
                        }
                    }
                },
                error: function() {
                    // generic error message
                    KB.notice('<p>Generic Ajax Error</p>', 'error');
                },
                complete: function() {
                    $('#publish').removeAttr('disabled');
                }
            });
        }

    };
}(jQuery));