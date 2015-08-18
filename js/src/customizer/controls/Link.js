var Link = require('fields/controls/link');
module.exports = wp.customize.Control.extend({
  ready: function () {
    var control = this;
    _.bind(control.updateValue, control);
    control.LinkField = new Link({
      el: control.selector
    });
    jQuery('#wp-link-wrap').css('zIndex', '99999999');

    var fn = _.bind(_.debounce(control.updateValue, 400), control);
    control.LinkField.on('update', fn, 400);
    control.LinkField.$text.on('keyup', fn);
    control.LinkField.$input.on('keyup', fn);
  },
  updateValue: function () {
    var control = this;
    var value = {
      linktext: control.LinkField.$text.val(),
      link: control.LinkField.$input.val()
    };
    control.setting.set(value);
  }

});