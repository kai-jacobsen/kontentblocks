var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Medium',
  template: require('templates/fields/Medium.hbs'),
  type: 'medium',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  postRender: function(){

  }
});




