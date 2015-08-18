var Link = require('fields/controls/link');
module.exports = wp.customize.Control.extend({
  ready: function () {
    var control = this;
    control.LinkField = new Link({
      el: control.selector
    });
    jQuery('#wp-link-wrap').css('zIndex', '99999999');

    control.LinkField.on('update', function (title, href) {
      var value = {
        title: title,
        href: href
      };
      control.setting.set(value);
    });

    control.LinkField.$text.on('keyup', _.throttle(function(){
        var value = {
          linktext: this.value,
          href: control.LinkField.$input.val()
        };
      console.log(value);
    }, 150) );

    control.setting.bind(function (value) {
      console.log('bound', value);
      console.trace();
    });
  }
});