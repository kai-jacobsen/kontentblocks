//KB.Backbone.Frontend.ModuleMenuItemView
module.exports = Backbone.View.extend({
  tagName: 'div',
  isValid: function () {
    return true;
  },
  render: function(){
    return this.el;
  }
});