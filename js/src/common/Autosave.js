var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = Backbone.View.extend({

  initialize: function () {
    var that = this;
    jQuery(document).ajaxSend(function (event, jqhxr, settings) {
      var data = settings.data;
      if (data.indexOf('wp_autosave') !== -1) {
        jqhxr.then(function (res) {
          if (res && res['wp_autosave']) {
            if (res['wp_autosave']['success']) {
              that.handleAutosave();
            }
          }
        })
      }
    });
  },
  handleAutosave: function () {
    var $form = jQuery('#post');
    if ($form.length === 0) {
      return false;
    }

    var formdata = $form.serializeJSON();

    Ajax.send({
      action: 'autosave',
      data: formdata,
      _ajax_nonce: Config.getNonce('update')
    }, this.success, this);
  },
  success: function (res) {
      console.log(res);
  }

});