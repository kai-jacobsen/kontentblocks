/**
 * UI scripts for admin menu entries "Areas" and "Templates"
 */
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = {
  loadingContainer: null,
  initiatorEl: null,
  sendButton: null,
  createSanitizedId: function (el, mode) {
    this.initiatorEl = jQuery(el);
    this.loadingContainer = this.initiatorEl.closest('.kb-menu-field').addClass('loading');
    this.$sendButton = jQuery('#kb-submit');

    this.disableSendButton();

    Ajax.send({
      inputvalue: el.value,
      checkmode: mode,
      action: 'getSanitizedId',
      _ajax_nonce: Config.getNonce('read')
    }, this.insertId, this);
  },
  insertId: function (res) {
    if (!res.success) {
      this.initiatorEl.addClass()
      jQuery('.kb-js-area-id').val('Please chose a different name');
    } else {
      jQuery('.kb-js-area-id').val(res.data.id);
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