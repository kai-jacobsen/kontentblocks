var KB = KB || {};

KB.Ajax = (function($) {

    return {
        send: function(data, callback, scope) {
            data.supplemental = data.supplemental || {};
            data.count = parseInt($('#kb_all_blocks').val(), 10);
            data.nonce = $('#_kontentblocks_ajax_nonce').val();
            data.post_id = parseInt($('#post_ID').val(), 10) || -1;
            data.kbajax = true;

            $(kbMetaBox).addClass('kb_loading');
            $('#publish').attr('disabled', 'disabled');

            return $.ajax({
                url: ajaxurl,
                data: data,
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
                    $(kbMetaBox).removeClass('kb_loading');
                    $('#publish').removeAttr('disabled');
                }
            });
        }

    };
}(jQuery));