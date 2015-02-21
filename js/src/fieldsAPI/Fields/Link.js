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
    return KB.Templates.render(
      this.templatePath, {
        config: this.config,
        baseId: this.baseId,
        kbfuid: this.kbfuid(index),
        index: index,
        i18n: _.extend(KB.i18n.Refields.link, KB.i18n.Refields.common),
        model: this.model.toJSON()
      });
  }
});

KB.FieldsAPI.register('link', KB.FieldsAPI.Link);



