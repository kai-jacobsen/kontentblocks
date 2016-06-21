var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Text',
  template: require('templates/fields/Select.hbs'),
  type: 'select',
  render: function () {
    console.log(this.model.toJSON());
    return this.template({
      model: this.model.toJSON()
    });
  }
});




