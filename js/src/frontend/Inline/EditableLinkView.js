//KB.Backbone.Inline.EditableImage
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var ModuleControl = require('frontend/Inline/controls/EditLink');

var EditableLink = Backbone.View.extend({
  initialize: function () {
    this.parentView = this.model.get('ModuleModel').View;
    this.render();
  },
  events: {
    'mouseenter': 'showControl'
    //'mouseleave': 'hideControl'
  },
  render: function () {
    this.delegateEvents();
    this.$el.addClass('kb-inline-imageedit-attached');
    this.$caption = jQuery('*[data-' + this.model.get('uid') + '-caption]');
    this.renderControl();
  },
  rerender: function () {
    this.render();
  },
  derender: function () {
    this.EditControl.remove();
    if (this.frame) {
      this.frame.dispose();
      this.frame = null;
    }
  },
  renderControl: function () {
    this.EditControl = new ModuleControl({
      model: this.model,
      parent: this
    });
  },
  showControl: function () {
    this.EditControl.show();
  },
  hideControl: function (e) {
    this.EditControl.hide();
  },
  openDialog: function () {
    var that = this;
    window.wpActiveEditor = 'ghosteditor';
    jQuery('#wp-link-wrap').addClass('kb-customized');

    // store the original function
    window.kb_restore_htmlUpdate = wpLink.htmlUpdate;
    window.kb_restore_isMce = wpLink.isMCE;

    wpLink.isMCE = function () {
      return false;
    };


    wpLink.htmlUpdate = function () {
      that.htmlUpdate.call(that);
    };

    wpLink.open();
    jQuery('#wp-link-text').val(this.model.get('value').linktext);
    jQuery('#wp-link-url').val(this.model.get('value').link);

  },
  htmlUpdate: function () {
    var attrs, html, start, end, cursor, href, title,
      textarea = wpLink.textarea, result;

    if (!textarea)
      return;

    // get contents of dialog
    attrs = wpLink.getAttrs();
    title = jQuery('#wp-link-text').val();
    // If there's no href, return.
    if (!attrs.href || attrs.href == 'http://')
      return;
    // Build HTML
    href = attrs.href;

    this.$el.attr('href', href);
    this .$el.text(title);

    var data = {
      link : href,
      linktext: title
    };

    //var kpath = this.model.get('kpath');
    this.model.set('value', data);


    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    this.close();
  },
  close: function(){
    // restore the original functions to wpLink
    wpLink.isMCE = window.kb_restore_isMce;
    wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
    this.EditControl.show();
  }
});

KB.Fields.registerObject('EditableLink', EditableLink);
module.exports = EditableLink;