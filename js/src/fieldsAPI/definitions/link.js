var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Link',
  template: require('templates/fields/Link.hbs'),
  type: 'link',
  //initialize:function(){
    //var fc = KB.FieldControls.add(this.model.toJSON());
    //BaseView.prototype.initialize.call(this, arguments);
  //},
  render: function () {
    return this.template({
      i18n: _.extend(KB.i18n.Refields.link, KB.i18n.Refields.common),
      model: this.model.toJSON()
    });
  }
});