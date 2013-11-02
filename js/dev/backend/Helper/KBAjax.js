var KB = KB || {};

KB.Ajax = (function($) {

    return {
        send: function(data, callback, scope) {



            data.supplemental = data.supplemental || {};

            
            data.count = parseInt($('#kb_all_blocks').val());
            data.nonce = $('#_kontentblocks_ajax_nonce').val();
            data.post_id = parseInt($('#post_ID').val()) || -1;
            data.kbajax = true;

            $(kbMetaBox).addClass('kb_loading');


            $('#publish').attr('disabled', 'disabled');
            $.ajax({
                url: ajaxurl,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        var count =  parseInt($('#kb_all_blocks').val()) + 1;
                        $('#kb_all_blocks').val(count);

                        if (scope){
                            callback.call(scope, data);
                        } else {
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
            })
        }

    };
}(jQuery));