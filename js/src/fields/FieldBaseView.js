//KB.Fields.BaseView
module.exports = Backbone.View.extend({
  rerender: function(){
    this.render();
  },
  gone: function () {
    console.log(this  );
    this.trigger('field.view.gone', this);
    this.derender();
  }
});
