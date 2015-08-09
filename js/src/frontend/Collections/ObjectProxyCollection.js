module.exports = Backbone.Collection.extend({

  initialize: function(){
    this.listenTo(this, 'add', this.attachHandler);
  },
  attachHandler: function(model){
    this.listenTo(model, 'remove', this.removeModel);
  },
  removeModel: function(model){
    this.remove(model);
  }

});