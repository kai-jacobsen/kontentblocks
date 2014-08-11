KB.FieldsAPI.Text = KB.FieldsAPI.Field.extend({

    templatePath: 'fields/Text',
    defaults: {
        std: '',
        label: 'Field label',
        description: 'A description',
        value: '',
        key: null
    },

    render: function (index) {
        return KB.Templates.render(this.templatePath, {config: this.config, baseId: this.baseId, index: index, model: this.model.toJSON()});
    }
});

KB.FieldsAPI.register('text', KB.FieldsAPI.Text);



