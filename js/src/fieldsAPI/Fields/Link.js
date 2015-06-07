var BaseView = require('fieldsAPI/Fields/BaseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Link',
  template: require('templates/fields/Link.hbs'),
  type: 'link',
  defaults: {
    std: {
      link: '',
      linktext: '',
      linktitle: ''
    },
    label: 'Link',
    description: '',
    key: null
  },
  //initialize:function(){
    //var fc = KB.FieldConfigs.add(this.model.toJSON());
    //BaseView.prototype.initialize.call(this, arguments);
  //},
  render: function () {
    return this.template({
      i18n: _.extend(KB.i18n.Refields.link, KB.i18n.Refields.common),
      model: this.model.toJSON()
    });
  }
});