var Link = require('fields/controls/link');
module.exports = wp.customize.Control.extend({
  ready: function(){
    var control = this;

    control.KBField = new Link({
      el: control.container.selector
    });
    console.log(control);
  }
});