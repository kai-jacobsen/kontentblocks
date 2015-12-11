var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$textarea = this.$('textarea');
    this.editor = tinyMCE.get(this.$textarea.attr('id'));
    tinymce.on('AddEditor', function(event){
      var editor = event.editor;
      if (editor && editor.id === that.$textarea.attr('id')){
        that.editor = editor;
        editor.on('change', function(){
          that.update(editor.getContent());
        });
      }
    });
  },
  derender: function () {

  },
  update: function (val) {
    this.model.set('value', val);
  }
});