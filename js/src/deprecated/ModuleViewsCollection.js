KB.Backbone.Frontend.ModuleViewsCollection = Backbone.Collection.extend({

  initialize: function(){
    this.listenTo(this, 'add', this.added)
  },
  added: function(View){
    return View;
  }

});