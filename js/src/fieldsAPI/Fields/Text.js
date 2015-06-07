var BaseView = require('fieldsAPI/Fields/BaseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Text',
  template: require('templates/fields/Text.hbs'),
  type: 'text',
  defaults: {
    std: '',
    label: 'Field label',
    description: 'A description',
    value: '',
    key: null
  },
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});




