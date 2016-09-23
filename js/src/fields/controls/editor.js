var BaseView = require('../FieldControlBaseView');
var TinyMCE = require('common/TinyMCE');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    tinymce.on('AddEditor', function (event) {
      var editor = event.editor;
      if (editor && editor.id === that.$textarea.attr('id') && !that.editor) {
        that.editor = editor;
        editor.on('change', function () {
          that.update(editor.getContent());
        });
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
  toString: function(){
    if (this.editor){
      try {
        return this.editor.getContent();
      } catch (e){
        return '';
      }
    }
    return '';
  }
});