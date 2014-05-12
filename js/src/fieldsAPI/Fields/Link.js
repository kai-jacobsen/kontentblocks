KB.FieldsAPI.Link = KB.FieldsAPI.Field.extend({

    templatePath: 'fields/Link',
    defaults: {
        std: {
            link: '',
            linktext: '',
            linktitle: ''
        },
        label: 'Link',
        description: '',
        key: null
    },

    render: function (index) {
        console.log('b4',this.model.toJSON());
        return KB.Templates.render(
            this.templatePath, {
                config: this.config,
                baseId: this.baseId,
                index: index,
                i18n: _.extend(KB.i18n.Refields.link, KB.i18n.Refields.common),
                model: this.model.toJSON()});
    }
});

KB.FieldsAPI.register('link', KB.FieldsAPI.Link);



