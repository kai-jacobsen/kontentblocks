var BaseView = require('fieldsAPI/Fields/BaseView');
module.exports = BaseView.extend({
  defaults: {
    std: 'some textvalue',
    label: 'Field label',
    description: 'A description',
    key: null
  },
  type: 'textarea',
  templatePath: 'fields/Textarea',
  template: require('templates/fields/Textarea.hbs'),
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});