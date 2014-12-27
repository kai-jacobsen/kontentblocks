/**
 * UI scripts for admin menu entries "Areas" and "Templates"
 */
KB.Menus = function ($) {

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
        _ajax_nonce: KB.Config.getNonce('read')
      }, this.insertId, this);
    },
    insertId: function (res) {
      if (!res.success) {
        this.initiatorEl.addClass()
        $('.kb-js-area-id').val('Please chose a different name');
      } else {
        $('.kb-js-area-id').val(res.data.id);
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
}(jQuery);