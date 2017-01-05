var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Color',
  template: require('templates/fields/Color.hbs'),
  type: 'color',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function () {
    return ''
  }
});




