var KB = KB || {};

KB.Ajax = (function($) {

    return {
        send: function(data, callback) {


            var nonce = $('#_kontentblocks_ajax_nonce').val();
            var postID = $('#post_ID').val();

            data._kb_nonce = nonce;
            data.post_id = postID;
            data.kbajax = 'true';



            $(kbMetaBox).addClass('kb_loading');
            $('#publish').attr('disabled', 'disabled');

            $.ajax({
                url: ajaxurl,
                data: data,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        callback;
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