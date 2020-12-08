var BaseView = require('../FieldControlBaseView');
var TinyMCE = require('common/TinyMCE');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    var settings = this.model.toJSON();
    this.$textarea = this.$('textarea');
    tinymce.on('AddEditor', function (event) {
      var editor = event.editor;
      if (editor && editor.id === that.$textarea.attr('id') && !that.editor) {
        that.editor = editor;
        editor.on('change', function () {
          that.update(editor.getContent());
        });

        if (settings.settings && settings.settings.charlimit) {
          var limit = settings.settings.charlimit;
          var $charlimit = that.$('.char-limit');
          editor.on('keyDown SetContent', function (ed, e) {
            var content = this.getContent({format: 'text'});
            var max = limit;
            var len = content.length;
            var rest = len - max;
            if (len >= max) {
              $charlimit.html('<span class="text-error" style="color: red;">Zu viele Zeichen:-' + rest +'</span>');
            } else {
              var charCount = max - len;
              $charlimit.html(charCount + ' Zeichen verbleiben');
            }
          })
        }

      }
    });
  },
  derender: function () {
    this.stopListening();
    this.editor = null;
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    if (this.editor) {
      try {
        return this.editor.getContent();
      } catch (e) {
        return '';
      }
    }
    return '';
  }
});