//KB.Backbone.Inline.EditableImage
var Config = require('common/Config');
var Utilities = require('common/Utilities');
var ModuleControl = require('frontend/Inline/controls/EditLink');
var UpdateControl = require('frontend/Inline/controls/InlineUpdate');
var Toolbar = require('frontend/Inline/InlineToolbar');
var EditableLink = Backbone.View.extend({
  initialize: function () {
    this.parentView = this.model.get('ModuleModel').View;
    this.setupDefaults();
    this.Toolbar = new Toolbar({
      FieldView: this,
      model: this.model,
      controls: [
        new ModuleControl({
          model: this.model,
          parent: this
        }),
        new UpdateControl({
          model: this.model,
          parent: this
        })
      ],
      tether: {
        offset: '0 -20px'
      }
    });
    this.render();
  },
  render: function () {
    this.delegateEvents();
    this.$caption = jQuery('*[data-' + this.model.get('uid') + '-caption]');
  },
  rerender: function () {
    this.render();
    this.trigger('field.view.rerender', this);
  },
  derender: function () {
    this.trigger('field.view.derender', this);
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
    this.$el.text(title);

    var data = {
      link: href,
      linktext: title
    };

    //var kpath = this.model.get('kpath');
    this.model.set('value', data);
    this.model.trigger('field.model.dirty');
    this.model.trigger('external.change', this.model);

    //restore the original function
    // close dialog and put the cursor inside the textarea
    wpLink.close();
    this.close();
  },
  close: function () {
    // restore the original functions to wpLink
    wpLink.isMCE = window.kb_restore_isMce;
    wpLink.htmlUpdate = window.kb_restore_htmlUpdate;
    KB.Events.trigger('content.change');
  },
  setupDefaults: function () {
    var val = this.model.get('value');
    if (!val || val === '') {
      val = {};
    }
    var sval = _.defaults(val, {
      link: '',
      linktext: ''
    });

    this.model.set('value', sval);
  },
  synchronize: function (model) {
    this.$el.attr('href', model.get('value').link);
    this.$el.html(model.get('value').linktext);
    this.model.trigger('field.model.dirty');
    KB.Events.trigger('content.change');

  }
});

KB.Fields.registerObject('EditableLink', EditableLink);
module.exports = EditableLink;