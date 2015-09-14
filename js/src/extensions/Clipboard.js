var ClipboardController = require('extensions/clipboard/ClipboardController');
module.exports = {

  init: function(){
    var $el = jQuery('#kontentblocks-clipboard');

    if ($el.length == 1){
      return new ClipboardController({
        el : $el.find('.inside')
      })
    }

  }

};