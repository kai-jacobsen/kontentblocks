var BaseView = require('../FieldControlBaseView');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    this.$input = this.$('.kb-field--oembed input');
    this.$preview = this.$('[data-kb-oembed-preview]');
    this.$input.on('change', function () {
      that.update(that.$input.val());
    })
    this.$input.trigger('change');
  },
  derender: function () {

  },
  update: function (val) {
    var that = this;
    this.model.set('value', val);
    var request = this.sendRequest(val).done(function (res) {
      if (res && res.data && res.data.html){
        that.$preview.html(res.data.html);
      }
    });
  },
  toString: function () {
    return '';
  },
  sendRequest: function (val) {
    return Ajax.send({
      action: 'getOembed',
      embedUrl: val,
      _ajax_nonce: Config.getNonce('read')
    })
  }
});