var BaseView = require('../FieldBaseView');
KB.Fields.registerObject('link', BaseView.extend({
  initialize: function(){
    this.render();
  },
  events:{
    'click .kb-js-add-link' : 'openModal'
  },
  render: function(){
    this.$input = this.$('.kb-js-link-input');
  },
  derender: function(){

  },
  openModal: function(){
    wpActiveEditor = this.$input.attr('id');
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    kb_restore_htmlUpdate = wpLink.htmlUpdate;
    kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = this.isMCE;
    wpLink.htmlUpdate = this.htmlUpdate;
    wpLink.open();

  },
  htmlUpdate: function(){
    var attrs, html, start, end, cursor, href,title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;

    // get contents of dialog
    attrs = wpLink.getAttrs();

    // If there's no href, return.
    if (!attrs.href || attrs.href == 'http://')
      return;
    // Build HTML
    href = attrs.href;
    title = attrs.title; // @TODO

    // Clear textarea
    jQuery(textarea).empty();

    //Append the Url to the textarea
    textarea.value = href;
    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    this.close();
    textarea.focus();
  },
  isMCE: function(){
    return false;
  },
  close: function(){
      // restore the original functions to wpLink
      wpLink.isMCE = kb_restore_isMce;
      wpLink.htmlUpdate = kb_restore_htmlUpdate;
  }
}));