KB.Backbone.Common.FieldConfigsCollection = Backbone.Collection.extend({
  model: KB.Backbone.Common.FieldConfigModel,
  initialize: function () {
    this.listenTo(this, 'add', this.log);
  },
  log: function(model){
  }
});