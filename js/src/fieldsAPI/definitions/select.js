var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Text',
  template: require('templates/fields/Select.hbs'),
  type: 'select',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});




