var BaseView = require('../FieldControlBaseView');
module.exports = BaseView.extend({
  initialize: function () {
    this.render();
  },
  render: function () {
    var that = this;
    if (jQuery('.kb-tags-input').length){
      window.tagBox && window.tagBox.init();
    }
  },
  toString: function(){
    return '';
  }
});