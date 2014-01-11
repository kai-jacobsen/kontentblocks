KB.Menus = (function ($) {

    return {
        loadingContainer: null,
        initiatorEl: null,
        createSanitizedId: function (el, mode) {
            this.initiatorEl = $(el);
            this.loadingContainer = this.initiatorEl.closest('.kb-menu-field').addClass('loading');
            $('#kb-submit').attr('disabled', 'disabled');

            KB.Ajax.send({
                inputvalue : el.value,
                checkmode: mode,
                action: 'getSanitizedId',
                _ajax_nonce : kontentblocks.nonces.read
            }, this.insertId, this);
        },

        insertId: function(res){

            console.log(res.success === false);
            if (res.success == false){
                this.initiatorEl.addClass(                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       )
                $('.kb-js-area-id').val('Please chose a different name');

            } else {
                $('.kb-js-area-id').val(res);
                $('#kb-submit').removeAttr('disabled');

            }

            this.loadingContainer.removeClass('loading');

        }

    }


}
    (jQuery)
    )