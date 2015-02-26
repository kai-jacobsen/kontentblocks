KB.FieldsAPI.Editor = KB.FieldsAPI.Field.extend({

  $editorWrap: null,
  templatePath: 'fields/Editor',
  defaults: {
    std: 'some textvalue',
    label: 'Field label',
    description: 'A description',
    value: '',
    key: null
  },
  initialize: function (config) {
    KB.FieldsAPI.Field.prototype.initialize.call(this, config);
  },
  setValue: function (value) {
    this.model.set('value', value);
  },
  render: function (index) {
    this.index = index;
    return KB.Templates.render(this.templatePath, {
      config: this.config,
      baseId: this.baseId,
      index: index,
      model: this.model.toJSON()
    });
  },
  postRender: function () {
    var name = this.model.get('baseId') + '[' + this.model.get('index') + ']' + '[' + this.model.get('primeKey') + ']';
    var edId = this.model.get('fieldId') + '_' + this.model.get('fieldKey') + '_editor_' + this.model.get('index');
    this.$editorWrap = jQuery('.kb-ff-editor-wrapper', this.$container);
    KB.TinyMCE.remoteGetEditor(this.$editorWrap, name, edId, this.model.get('value'), 5, false);

  }

});

KB.FieldsAPI.register('editor', KB.FieldsAPI.Editor);
