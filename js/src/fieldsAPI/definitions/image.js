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
  initialize: function (config) {
    BaseView.prototype.initialize.call(this, config);
  },
  render: function (index) {
    return this.template({
      kbfuid: this.kbfuid(),
      index: index,
      model: this.model.toJSON(),
      i18n: _.extend(KB.i18n.Refields.image, KB.i18n.Refields.common)
    });
  },
  setValue: function (value) {

    if (!value){
      value = this.defaults.value;
    }


    var attrs;
    var that = this;
    var args = {
      width: 150,
      height: 150,
      upscale: false,
      crop: true
    };


    if (!value.id) {
      return;
    }
    this.model.set('value', value);
    if (Utilities.stex.get('img' + value.id + 'x' + args.width + 'x' + args.height)) {
      attrs = that.model.get('value');
      attrs.url = Utilities.stex.get('img' + value.id + 'x' + args.width + 'x' + args.height);
    } else {
      jQuery.ajax({
        url: ajaxurl,
        data: {
          action: "fieldGetImage",
          args: args,
          id: value.id,
          _ajax_nonce: Config.getNonce('read')
        },
        type: "POST",
        dataType: "json",
        async: false,
        success: function (res) {
          Utilities.stex.set('img' + value.id + 'x' + args.width + 'x' + args.height, res.data.src, 60 * 1000 * 60);
          var attrs = that.model.get('value');
          attrs.url = res.data.src;
        },
        error: function () {
          _K.error('Unable to get image');
        }
      });
    }
  }
});