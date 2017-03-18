//KB.Backbone.ModuleDefinition
module.exports = Backbone.Model.extend({
  initialize: function () {
    var that = this;
    console.log(this);
    this.id = (function () {
      if (that.get('settings').category === 'template') {
        return that.get('mid');
      } else {
        return that.get('settings').class;
      }
    }());
  }
});