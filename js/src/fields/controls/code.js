var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.defaults = {
      mode: 'htmlmixed',
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: true,
      tabMode: "indent",
      indentUnit: 4,
      autoCloseBrackets: true,
      autoCloseTags: true
    };
    this.settings = this.model.get('settings') || {};
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    // this.$textarea.on('change', function () {
    //   that.update(that.$textarea.val());
    // });
    this.editor = this.getEditor();
    this.editor.on('change',function(editor) {
      editor.save();
      that.update(editor.getTextArea().value);
    });
  },
  derender: function () {
    if (this.editor){
      this.editor.save();
      this.editor.toTextArea();
    }
    this.editor = null;
    delete this.editor;


  },
  getEditor: function(){

    if (this.editor){
      return this.editor;
    }

    var settings = _.extend(this.defaults, this.settings);
    this.editor = CodeMirror.fromTextArea(this.$textarea.get(0), settings);
    return this.editor;
  },
  update: function (val) {
    this.model.set('value', val);
  },
  toString: function () {
    if (this.editor){
      var txt = this.editor.getTextArea().value;
      return txt;
    }
    return this.$textarea.val();
  }
});