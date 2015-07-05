//KB.Backbone.Frontend.ModuleMenuItemView
module.exports = Backbone.View.extend({
  tagName: 'a',
  isValid: function () {
    return true;
  },
  render: function(){
    return this.el;
  }
});