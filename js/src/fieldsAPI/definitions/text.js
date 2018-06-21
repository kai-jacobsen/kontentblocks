var BaseView = require('fieldsAPI/definitions/baseView');
module.exports = BaseView.extend({
  templatePath: 'fields/Text',
  template: require('templates/fields/Text.hbs'),
  type: 'text',
  render: function () {
    return this.template({
      model: this.model.toJSON()
    });
  },
  getDefaults: function(){
    return '';
  },
  charcount: function (content, $charlimit, limit) {
    var max = limit;
    var len = content.length;
    var charCount = max - len;
    $charlimit.html(charCount + " chars left");
  }
});




