var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Oembed',
  template: require('templates/fields/Oembed.hbs'),
  type: 'oembed',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function () {
    return '';
  }
});




