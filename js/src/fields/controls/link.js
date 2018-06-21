var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  events: {
    'click .kb-js-add-link': 'openModal'
  },
  render: function () {
    this.$input = this.$('[data-kbf-link-url]');
    this.$text = this.$('[data-kbf-link-linktext]');
    this.$target = this.$('[data-kbf-link-target]');
  },
  derender: function () {

  },
  openModal: function () {
    window._kbLink = this;
    wpActiveEditor = this.$input.attr('id');
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
    window.kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = this.isMCE;
    wpLink.htmlUpdate = this.htmlUpdate;
    wpLink.open();
    jQuery('#wp-link-text').val(this.$text.val());
    jQuery('#wp-link-url').val(this.$input.val());

    if (!this.model.get('showtarget')){
      jQuery('#link-selector .link-target').addClass('kb-hide');
    }

    this.setTarget();

  },
  setTarget: function () {
    var $mTarget = jQuery('#wp-link-target');
    if (this.$target.is(':checked')) {
      $mTarget.prop('checked', true);
    } else {
      $mTarget.prop('checked', false);
    }
  },
  setTargetFromModal: function (target) {
    if (target === '_blank') {
      this.$target.prop('checked', true);
    } else {
      this.$target.prop('checked', false);
    }

  },
  htmlUpdate: function () {
    var target, attrs, html, start, end, cursor, href, title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;
    // get contents of dialog
    attrs = wpLink.getAttrs();
    title = jQuery('#wp-link-text').val();

    target = attrs.target;
    window._kbLink.setTargetFromModal(target);

    // If there's no href, return.
    if (!attrs.href)
      return;
    // Build HTML
    href = attrs.href;
    // Clear textarea
    // jQuery(textarea).empty();
    window._kbLink.$input.empty();

    //Append the Url to the textarea
    window._kbLink.$input.val(href);

    window._kbLink.trigger('update', title, href);
    window._kbLink.$text.val(title);

    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    window._kbLink.close();
    textarea.focus();
  },
  isMCE: function () {
    return false;
  },
  close: function () {
    // restore the original functions to wpLink
    if (!this.model.get('showtarget')){
      jQuery('#link-selector .link-target').removeClass('kb-hide');
    }
    wpLink.isMCE = window.kb_restore_isMce;
    wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
  }
});