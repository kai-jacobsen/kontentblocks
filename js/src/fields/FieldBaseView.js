//KB.Fields.BaseView
module.exports = Backbone.View.extend({
  rerender: function(){
    this.render();
  },
  gone: function () {
    this.trigger('field.view.gone', this);
    this.derender();
  }
});
