var Link = require('fields/controls/link');
module.exports = wp.customize.Control.extend({
  ready: function(){
    var control = this;
    control.KBField = new Link({
      el: control.selector
    });
    jQuery('#wp-link-wrap').css('zIndex', '99999999');
    control.KBField.on('update', function(a,b){
      alert(a);
    })

  }
});