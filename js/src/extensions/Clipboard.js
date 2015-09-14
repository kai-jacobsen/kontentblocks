var ClipboardController = require('extensions/clipboard/ClipboardController');
module.exports = {

  init: function(){
    var $el = jQuery('#kontentblocks-clipboard');
      return new ClipboardController({
        el : $el.find('.inside')
      })
  }

};