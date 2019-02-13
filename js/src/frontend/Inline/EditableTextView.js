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
    this.listenToOnce(this.model.get('ModuleModel'), 'remove', this.deactivate);
    this.listenToOnce(this.model.get('ModuleModel'), 'module.create', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.show', this.showPlaceholder);
    this.listenTo(KB.Events, 'editcontrols.hide', this.removePlaceholder);
    this.listenTo(this, 'kn.inline.synced', this.deactivate);
    this.Toolbar = new Toolbar({
      FieldControlView: this,
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
  showPlaceholder: function () {
    this.preValue = this.model.get('value');
    var $isEmpty = _.isEmpty(this.cleanString(this.model.get('value')));
    if ($isEmpty) {
      this.$el.html('<p>Start writing here</p>');
    }
  },
  removePlaceholder: function () {
    var $isEmpty = _.isEmpty(this.cleanString(this.model.get('value')));
    if ($isEmpty) {
      this.$el.html(this.preValue);
    }
  },
  render: function () {
    if (this.el.id) {
      this.id = this.el.id;
    }
    console.trace();
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
  setupEvents: function () {
    var $edEl = $('#' + this.id);
    var that = this;
    KB.Events.trigger('KB::tinymce.new-inline-editor', this.editor);
    this.editor.kfilter = (this.model.get('filter') && this.model.get('filter') === 'content');
    this.editor.module = this.model.get('ModuleModel');
    var con = Utilities.getIndex(this.editor.module.get('entityData'), this.model.get('kpath'));
    if (this.editor.kfilter) {
      this.editor.setContent(switchEditors.wpautop(con));
    }
    this.editor.previousContent = this.editor.getContent();
    this.editor.module.View.$el.addClass('kb-inline-text--active');
    this.editor.subscribe('editableInput', this.handleChange.bind(this));
  },
  handleChange: function () {
    var content = this.editor.getContent();
    if (this.editor.kfilter) {
      content = switchEditors._wp_Nop(this.editor.getContent());
    }
    this.model.set('value', content);
    // this.model.syncContent = this.editor.getContent();
    this.model.trigger('external.change', this.model);
    this.model.trigger('field.model.dirty', this.model);
    KB.Events.trigger('content.change');
    this.editor.isDirty = true;
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
        var $edEl = $('#' + that.id).html(res.data.content);
        ed.destroy();
        setTimeout(function () {
          if (window.twttr) {
            window.twttr.widgets.load();
          }
          jQuery(window).off('scroll.kbmce resize.kbmce');
          ed.off('nodeChange ResizeEditor ResizeWindow');
        }, 500);
      },
      error: function () {
      }
    });
  },
  activate: function (e) {
    if (KB.EditModalModules) {
      KB.EditModalModules.destroy();
    }
    e.stopPropagation();
    if (!this.editor) {
      this.editor = new MediumEditor('#' + this.id, {
        toolbar: {
          diffTop: -50
        }
      });
      this.setupEvents();
    } else {
      this.editor.setup();
      this.setupEvents();
    }
  },
  deactivate: function () {
    if (this.editor) {
      this.editor.unsubscribe('editableInput', this.handleChange.bind(this));
      // var content = this.editor.getContent();
      var content = Utilities.getIndex(this.editor.module.get('entityData'), this.model.get('kpath'));

      // apply filter
      if (this.editor.kfilter) {
        content = switchEditors._wp_Nop(content);
        this.retrieveFilteredContent(this.editor, content);
      } else {
        this.editor.destroy();
        KB.Events.trigger('kb.repaint'); // @TODO figure this out
      }
    }
  },
  cleanString: function (string) {
    return string.replace(/\s/g, '')
      .replace(/&nbsp;/g, '')
      .replace(/<br>/g, '')
      .replace(/<[^\/>][^>]*><\/[^>]+>/g, '')
      .replace(/<p><\/p>/g, '');
  },
  synchronize: function (model) {
    if (this.editor) {
      this.editor.setContent(model.syncContent);
    } else {
      this.$el.html(model.syncContent);
    }
    this.model.trigger('field.model.dirty', this.model);

  }
});


module.exports = EditableText;