var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/TextMultiple',
  template: require('templates/fields/TextMultiple.hbs'),
  type: 'text-multiple',
  render: function () {
    var el = this.template({
      model: this.model.toJSON()
    });
    this.setElement(el);
    return this.$el;
  }
  
});




