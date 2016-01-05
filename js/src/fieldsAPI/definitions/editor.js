var TinyMCE = require('common/TinyMCE');
var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  $editorWrap: null,
  templatePath: 'fields/Editor',
  template: require('templates/fields/Editor.hbs'),
  type: 'editor',
  initialize: function (config) {
    BaseView.prototype.initialize.call(this, config);
  },
  setValue: function (value) {
    this.model.set('value', value);
  },
  render: function (index) {
    this.index = index;
    return this.template({
      config: this.config,
      baseId: this.baseId,
      index: index,
      model: this.model.toJSON()
    });
  },
  postRender: function () {
    console.log(this.model);
    var name = this.model.get('baseId') + '[' + this.model.get('index') + ']' + '[' + this.model.get('primeKey') + ']';
    var edId = this.model.get('fieldId') + '_' + this.model.get('key') + '_editor_' + this.model.get('index');
    this.$editorWrap = jQuery('.kb-ff-editor-wrapper-' + this.model.get('index') + '-' + this.model.get('key'), this.$el);
    TinyMCE.remoteGetEditor(this.$editorWrap, name, edId, this.model.get('value'), null, false);
  }
});