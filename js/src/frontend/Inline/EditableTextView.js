//KB.Backbone.Inline.EditableText
var Utilities = require('common/Utilities');
var Config = require('common/Config');
var ModuleControl = require('frontend/Inline/controls/EditText');
var UpdateControl = require('frontend/Inline/controls/InlineUpdate');
var Toolbar = require('frontend/Inline/InlineToolbar');
var EditableText = Backbone.View.extend({
  initialize: function () {
    this.settings = this.model.get('tinymce');
    this.parentView = this.model.get('ModuleModel').View;
    this.setupDefaults();
    this.listenToOnce(this.model.get('ModuleModel'), 'remove', this.deactivate);
    this.listenToOnce(this.model.get('ModuleModel'), 'module.create', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);

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
      ]
    });
    this.render();
  },
  showPlaceholder: function(){
    this.preValue = this.model.get('value');
    var $isEmpty = _.isEmpty(this.cleanString(this.model.get('value')));
    if ($isEmpty){
      this.$el.html('<p>Start writing here</p>');
    }
  },
  removePlaceholder: function(){
    var $isEmpty = _.isEmpty(this.cleanString(this.model.get('value')));
    if ($isEmpty){
      this.$el.html(this.preValue);
    }
  },
  render: function () {
    if (this.el.id) {
      this.id = this.el.id;
    }
    this.Toolbar.show();

  },
  derender: function () {
    this.deactivate();
    this.trigger('field.view.derender', this);
    this.$el.off();
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.Toolbar.hide();
  },
  rerender: function () {
    this.render();
    this.trigger('field.view.rerender', this);

  },
  setupDefaults: function () {
    var that = this;
    // defaults
    var defaults = {
      theme: 'modern',
      skin: false,
      menubar: false,
      add_unload_trigger: false,
      fixed_toolbar_container: null,
      //fixed_toolbar_container: '#kb-toolbar',
      schema: 'html5',
      inline: true,
      plugins: 'textcolor, wptextpattern',
      statusbar: false,
      preview_styles: false,

      setup: function (ed) {
        ed.on('init', function () {
          that.editor = ed;
          ed.module = that.model.get('ModuleModel');
          ed.kfilter = (that.model.get('filter') && that.model.get('filter') === 'content') ? true : false;
          KB.Events.trigger('KB::tinymce.new-inline-editor', ed);
          ed.focus();

          jQuery('.mce-panel.mce-floatpanel').hide();
          jQuery(window).on('scroll.kbmce resize.kbmce', function () {
            jQuery('.mce-panel.mce-floatpanel').hide();
          });

        });

        ed.on('selectionchange mouseup', function (e) {
          that.getSelection(ed, e);
        });

        ed.on('NodeChange', function (e) {
          KB.Events.trigger('window.change');
        });

        ed.on('focus', function () {
          var con;
          window.wpActiveEditor = that.el.id;
          con = Utilities.getIndex(ed.module.get('moduleData'), that.model.get('kpath'));
          if (ed.kfilter) {
            ed.setContent(switchEditors.wpautop(con));
          }
          ed.previousContent = ed.getContent();

          that.$el.addClass('kb-inline-text--active');
        });

        //ed.addButton('kbcancleinline', {
        //  title: 'Stop inline Edit',
        //  onClick: function () {
        //    if (tinymce.activeEditor.isDirty()) {
        //      tinymce.activeEditor.module.View.getDirty();
        //    }
        //    tinymce.activeEditor.fire('blur');
        //    tinymce.activeEditor = null;
        //    tinymce.focusedEditor = null;
        //    document.activeElement.blur();
        //    jQuery('#kb-toolbar').hide();
        //  }
        //});
        ed.on('blur', function (e) {
          var content;
          that.$el.removeClass('kb-inline-text--active');
          content = ed.getContent();

          // apply filter
          if (ed.kfilter) {
            content = switchEditors._wp_Nop(ed.getContent());
          }

          // get a copy of module data
          //moduleData = _.clone(ed.module.get('moduleData'));
          //path = that.model.get('kpath');
          //Utilities.setIndex(moduleData, path, content);


          // && ed.kfilter set
          if (ed.isDirty()) {
            if (ed.kfilter) {
              that.retrieveFilteredContent(ed, content);
            } else {
              //ed.module.set('moduleData', moduleData);
              that.model.set('value', content);
              that.model.syncContent = ed.getContent();
              that.model.trigger('external.change', that.model);
              that.model.trigger('field.model.dirty', that.model);
              KB.Events.trigger('content.change');

            }
          } else {
            ed.setContent(ed.previousContent);

          }
        });
      }
    };
    this.defaults = _.extend(defaults, this.settings);
  },
  retrieveFilteredContent: function (ed, content) {
    var that = this;
    jQuery.ajax({
      url: ajaxurl,
      data: {
        action: 'applyContentFilter',
        content: content,
        postId: ed.module.toJSON().parentObjectId,
        _ajax_nonce: Config.getNonce('read')
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        ed.setContent(res.data.content);
        that.model.set('value', content);
        that.model.syncContent = ed.getContent();

        that.model.trigger('field.model.dirty',that.model);
        that.model.trigger('external.change', that.model);
        KB.Events.trigger('content.change');

        //ed.module.trigger('kb.frontend.module.inlineUpdate');
        setTimeout(function () {
          if (window.twttr) {
            window.twttr.widgets.load();
          }
          jQuery(window).off('scroll.kbmce resize.kbmce');
          ed.off('nodeChange ResizeEditor ResizeWindow');
          that.deactivate();
        }, 500);
      },
      error: function () {
      }
    });
  },
  activate: function (e) {

    if (KB.EditModalModules){
      KB.EditModalModules.destroy();
    }
    e.stopPropagation();
    if (!this.editor) {
      tinymce.init(_.defaults(this.defaults, {
        selector: '#' + this.id
      }));
    }
  },
  deactivate: function () {
    if (this.editor) {
      var ed = this.editor;
      this.editor = null;
      tinyMCE.execCommand('mceRemoveEditor', true, ed.id);
      KB.Events.trigger('kb.repaint'); // @TODO figure this out
    }
  },
  cleanString: function (string) {
    return string.replace(/\s/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/<br>/g, '')
      .replace(/<[^\/>][^>]*><\/[^>]+>/g, '')
      .replace(/<p><\/p>/g, '');
  },
  getSelection: function (editor, event) {
    var sel = editor.selection.getContent();
    var $toolbar = jQuery('.mce-panel.mce-floatpanel');
    if (sel === '') {
      $toolbar.hide();
    } else {
      var mpos = markSelection();
      var w = $toolbar.width();
      $toolbar.css({top: mpos.top - 40 + 'px', left: mpos.left - w + 'px'});
      $toolbar.show();
    }
  },
  synchronize: function (model) {
    if (this.editor){
      this.editor.setContent(model.syncContent);
    } else {
      this.$el.html(model.syncContent);
    }
    this.model.trigger('field.model.dirty',this.model);

  }
});

var markSelection = (function () {
  var markerTextChar = "\ufeff";
  var markerTextCharEntity = "&#xfeff;";

  var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

  var selectionEl;

  return function () {
    var sel, range;
    if (document.selection && document.selection.createRange) {
      // Clone the TextRange and collapse
      range = document.selection.createRange().duplicate();
      range.collapse(false);

      // Create the marker element containing a single invisible character by creating literal HTML and insert it
      range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + '</span>');
      markerEl = document.getElementById(markerId);
    } else if (window.getSelection) {
      sel = window.getSelection();

      if (sel.getRangeAt) {
        range = sel.getRangeAt(0).cloneRange();
      } else {
        // Older WebKit doesn't have getRangeAt
        range.setStart(sel.anchorNode, sel.anchorOffset);
        range.setEnd(sel.focusNode, sel.focusOffset);

        // Handle the case when the selection was selected backwards (from the end to the start in the
        // document)
        if (range.collapsed !== sel.isCollapsed) {
          range.setStart(sel.focusNode, sel.focusOffset);
          range.setEnd(sel.anchorNode, sel.anchorOffset);
        }
      }

      range.collapse(false);

      // Create the marker element containing a single invisible character using DOM methods and insert it
      markerEl = document.createElement("span");
      markerEl.id = markerId;
      var $markerEl = jQuery(markerEl);
      $markerEl.prepend(document.createTextNode(markerTextChar));
      range.insertNode(markerEl);
    }

    if (markerEl) {
      // Find markerEl position http://www.quirksmode.org/js/findpos.html
      var obj = markerEl;
      var left = 0, top = 0;
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
      } while (obj = obj.offsetParent);


      markerEl.parentNode.removeChild(markerEl);
      $markerEl.remove();


      return {
        left: left,
        top: top
      };
    }
  };
})();


module.exports = EditableText;