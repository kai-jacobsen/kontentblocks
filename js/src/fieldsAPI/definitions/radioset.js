var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Radioset',
  template: require('templates/fields/Radioset.hbs'),
  type: 'radioset',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  }
});




