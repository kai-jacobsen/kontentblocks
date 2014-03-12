KB.Menus = (function ($) {

    return {
        loadingContainer: null,
        initiatorEl: null,
        sendButton: null,
        createSanitizedId: function (el, mode) {
            this.initiatorEl = $(el);
            this.loadingContainer = this.initiatorEl.closest('.kb-menu-field').addClass('loading');
            this.$sendButton = $('#kb-submit');

            this.disableSendButton();

            KB.Ajax.send({
                inputvalue: el.value,
                checkmode: mode,
                action: 'getSanitizedId',
                _ajax_nonce: kontentblocks.nonces.read
            }, this.insertId, this);
        },

        insertId: function (res) {

            if (res === 'translate') {
                this.initiatorEl.addClass()
                $('.kb-js-area-id').val('Please chose a different name');

            } else {
                $('.kb-js-area-id').val(res);
                this.enableSendButton();
            }

            this.loadingContainer.removeClass('loading');

        },
        disableSendButton: function () {
            this.$sendButton.attr('disabled', 'disabled').val('Disabled');
        },
        enableSendButton: function () {
            this.$sendButton.attr('disabled', false).val('Create');

        }

    }


}
    (jQuery)
    )