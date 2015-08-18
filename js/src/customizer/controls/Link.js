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

    var updateLinktext = _.debounce(function(){
      var value = {
        linktext: this.value,
        href: control.LinkField.$input.val()
      };
      control.setting.set(value);
    }, 400);
    control.LinkField.$text.on('keyup', updateLinktext );

    var updateUrl = _.debounce(function(){
      var value = {
        href: this.value,
        linktext: control.LinkField.$text.val()
      };
      control.setting.set(value);
    }, 400);
    control.LinkField.$input.on('keyup', updateUrl );

    control.setting.bind(function (value) {
      console.log('bound', value);
      console.trace();
    });
  }
});