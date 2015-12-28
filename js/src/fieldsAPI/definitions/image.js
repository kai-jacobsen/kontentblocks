//var Field = require('fields/controls/image');
var BaseView = require('fieldsAPI/definitions/baseView');
var Utilities = require('common/Utilities');
var Config = require('common/Config');
module.exports = BaseView.extend({
  $currentWrapper: null,
  $currentFrame: null,
  templatePath: 'fields/Image',
  template: require('templates/fields/Image.hbs'),
  type: 'image',
  render: function (index) {
    return this.template({
      model: this.model.toJSON(),
      i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
    });
  },
  postRender: function () {
    var value = this.model.get('value');
    var queryargs = {};
    var that = this;
    if (this.model.get('value').id !== '') {
      queryargs.post__in = [this.model.get('value').id];
      wp.media.query(queryargs) // set the query
        .more() // execute the query, this will return an deferred object
        .done(function () { // attach callback, executes after the ajax call succeeded
          var attachment = this.first();
          if (attachment) {
            attachment.set('attachment_id', attachment.get('id'));
            if (that.fieldModel && that.fieldModel.FieldControlView) {
              that.fieldModel.FieldControlView.handleAttachment(attachment);
            }
          }
        });
    }
  }
});