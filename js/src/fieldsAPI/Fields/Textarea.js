KB.FieldsAPI.Textarea = KB.FieldsAPI.Field.extend({

  defaults: {
    std: 'some textvalue',
    label: 'Field label',
    description: 'A description',
    key: null
  },

  templatePath: 'fields/Textarea',
  render: function (index) {
    return KB.Templates.render(this.templatePath, {
      config: this.config,
      baseId: this.baseId,
      index: index,
      model: this.model.toJSON()
    });
  }
});

KB.FieldsAPI.register('textarea', KB.FieldsAPI.Textarea);



