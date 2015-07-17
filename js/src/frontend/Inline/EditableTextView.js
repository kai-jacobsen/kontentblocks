//KB.Backbone.Inline.EditableText
var Utilities = require('common/Utilities');
var Config = require('common/Config');
var ModuleControl = require('frontend/Inline/controls/EditText');

var EditableText = Backbone.View.extend({
  initialize: function () {
    this.placeHolderSet = false;
    this.placeholder = "<span class='kb-editable-text-placeholder'>Start typing here</span>";
    this.settings = this.model.get('tinymce');
    this.parentView = this.model.get('ModuleModel').View;
    this.setupDefaults();
    this.maybeSetPlaceholder();
    this.listenToOnce(this.model.get('ModuleModel'), 'remove', this.deactivate);
    this.render();
    this.$('a').on('click', function (e) {
      e.preventDefault();
    });
  },
  render: function () {
    if (this.el.id) {
      this.id = this.el.id;
    }
    this.renderControl();
  },
  derender: function () {
    this.EditControl.remove();
    this.deactivate();
  },
  rerender: function () {
    this.render();
  },
  renderControl: function () {
    this.EditControl = new ModuleControl({
      model: this.model,
      parent: this
    });
  },
  events: {
    //'click': 'activate',
    'mouseenter': 'showControl'
  },
  showControl: function () {
    this.EditControl.show();
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
      plugins: 'textcolor',
      statusbar: false,
      preview_styles: false,

      setup: function (ed) {
        ed.on('init', function () {
          that.editor = ed;
          ed.module = that.model.get('ModuleModel');
          ed.kfilter = (that.model.get('filter') && that.model.get('filter') === 'content') ? true : false;
          ed.kpath = that.model.get('kpath');
          ed.module.View.$el.addClass('inline-editor-attached');
          KB.Events.trigger('KB::tinymce.new-inline-editor', ed);
          ed.focus();
          jQuery('.mce-panel.mce-floatpanel').hide();

          jQuery(window).on('scroll resize',function(){
            jQuery('.mce-panel.mce-floatpanel').hide();
          });

        });

        ed.on('NodeChange', function(e){
          console.log('nodechanged');
          that.getSelection(ed, e);

        });

        ed.on('click', function (e) {
          that.getSelection(ed, e);
          e.stopPropagation();
        });

        ed.on('focus', function () {
          if (that.placeHolderSet) {
            that.$el.html('');
            that.placeHolderSet = false;
          }
          window.wpActiveEditor = that.el.id;
          var con = Utilities.getIndex(ed.module.get('moduleData'), ed.kpath);
          ed.previousContent = ed.getContent();
          if (ed.kfilter) {
            ed.setContent(switchEditors.wpautop(con));
          }
          jQuery('#kb-toolbar').show();
          ed.module.View.$el.addClass('inline-edit-active');
          if (that.placeHolderSet) {
            ed.setContent('');
          }
        });

        ed.addButton('kbcancleinline', {
          title: 'Stop inline Edit',
          onClick: function () {
            if (tinymce.activeEditor.isDirty()) {
              tinymce.activeEditor.module.View.getDirty();
            }
            tinymce.activeEditor.fire('blur');
            tinymce.activeEditor = null;
            tinymce.focusedEditor = null;
            document.activeElement.blur();
            jQuery('#kb-toolbar').hide();
          }
        });

        ed.on('blur', function (e) {
          var content, moduleData, path;
          ed.module.View.$el.removeClass('inline-edit-active');
          jQuery('#kb-toolbar').hide();
          content = ed.getContent();
          if (ed.kfilter) {
            content = switchEditors._wp_Nop(ed.getContent());
          }
          moduleData = _.clone(ed.module.get('moduleData'));
          path = ed.kpath;
          Utilities.setIndex(moduleData, path, content);
          // && ed.kfilter set
          if (ed.isDirty()) {
            ed.placeholder = false;
            if (ed.kfilter) {
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
                  ed.module.set('moduleData', moduleData);
                  //ed.module.trigger('kb.frontend.module.inlineUpdate');
                  if (window.twttr) {
                    window.twttr.widgets.load();
                  }
                },

                error: function () {
//                                ed.module.trigger('change');
//                                ed.module.set('moduleData', moduleData);
                }
              });
            } else {
              ed.module.set('moduleData', moduleData);
              //ed.module.trigger('kb.frontend.module.inlineUpdate');
            }
          } else {
            ed.setContent(ed.previousContent);
          }
          that.maybeSetPlaceholder();

          setTimeout(function(){
            that.deactivate();
          }, 500);
        });
      }
    };
    this.defaults = _.extend(defaults, this.settings);
  },
  activate: function (e) {
    e.stopPropagation();
    if (!this.editor) {
      tinymce.init(_.defaults(this.defaults, {
        selector: '#' + this.id
      }));
    }
  },
  deactivate: function () {
    if (this.editor){
      this.editor.destroy();
    }
    this.editor = null;
  },
  maybeSetPlaceholder: function () {
    var string = (this.editor) ? this.editor.getContent() : this.$el.html();
    var content = this.cleanString(string);
    if (_.isEmpty(content)) {
      this.$el.html(this.placeholder);
      this.placeHolderSet = true;
    }
  },
  cleanString: function (string) {
    // placeholder
    return string.replace(/\s/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/<br>/g, '')
      .replace(/<p><\/p>/g, '');
  },
  getSelection: function (editor, event) {
    //console.log(editor.selection.getContent());
    var sel = editor.selection.getContent();
    if (sel === ''){

      jQuery('.mce-panel.mce-floatpanel').hide();
    } else {
      jQuery('.mce-panel.mce-floatpanel').show();
      var mpos = markSelection();
      var w = jQuery('.mce-panel.mce-floatpanel').width();
      jQuery('.mce-panel.mce-floatpanel').offset({top:mpos.top-40, left:mpos.left-w})

    }

  }
});

var markSelection = (function() {
  var markerTextChar = "\ufeff";
  var markerTextCharEntity = "&#xfeff;";

  var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

  var selectionEl;

  return function() {
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
      $markerEl.prepend( document.createTextNode(markerTextChar) );
      range.insertNode(markerEl);
    }

    if (markerEl) {
      // Lazily create element to be placed next to the selection
      //if (!selectionEl) {
      //  selectionEl = document.createElement("div");
      //  selectionEl.style.border = "solid darkblue 1px";
      //  selectionEl.style.backgroundColor = "lightgoldenrodyellow";
      //  selectionEl.innerHTML = "&lt;- selection";
      //  selectionEl.style.position = "absolute";
      //
      //  document.body.appendChild(selectionEl);
      //}

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
      // Move the button into place.
      // Substitute your jQuery stuff in here
      //selectionEl.style.left = left + "px";
      //selectionEl.style.top = top + "px";

    }
  };
})();


module.exports = EditableText;