var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Checkbox',
  template: require('templates/fields/Checkbox.hbs'),
  type: 'checkbox',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});




