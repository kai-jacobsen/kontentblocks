var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  type: 'textarea',
  templatePath: 'fields/Textarea',
  template: require('templates/fields/Textarea.hbs'),
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function(){
    return '';
  }
});