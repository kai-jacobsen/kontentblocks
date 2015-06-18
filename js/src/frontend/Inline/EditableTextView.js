//KB.Backbone.Inline.EditableText
var Utilities = require('common/Utilities');
var Config = require('common/Config');
var EditableText = Backbone.View.extend({
  initialize: function () {
    this.placeHolderSet = false;
    this.placeholder = "<span class='kb-editable-text-placeholder'>Start typing here</span>";
    this.settings = this.model.get('tinymce');
    this.setupDefaults();
    this.maybeSetPlaceholder();
    this.listenToOnce(this.model.get('ModuleModel'), 'remove', this.deactivate);
    this.render();
  },
  render: function () {
    if (this.el.id) {
      this.id = this.el.id;
    }
  },
  derender: function () {
    this.deactivate();
  },
  rerender: function () {
    this.render();
  },
  events: {
    'click': 'activate'
  },
  setupDefaults: function () {
    var that = this;
    // defaults
    var defaults = {
      theme: 'modern',
      skin: false,
      menubar: false,
      add_unload_trigger: false,
      fixed_toolbar_container: '#kb-toolbar',
      schema: 'html5',
      inline: true,
      plugins: 'textcolor, wplink',
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
          ed.fire('focus');
          ed.focus();
        });

        ed.on('click', function (e) {
          e.stopPropagation();
        });

        ed.on('focus', function () {
          if (that.placeHolderSet) {
            that.$el.html('');
            that.placeHolderSet = false;
          }
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

        ed.on('change', function () {

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

        ed.on('blur', function () {
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
                  if (window.twttr){
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
    tinyMCE.execCommand('mceRemoveEditor', false, this.id);
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
  }
});

module.exports = EditableText;