module.exports = Backbone.Collection.extend({

  filterByAttr: function(attr, value){
    return this.filter(function(module){
      return (module.get(attr) === value);
    }, this);
  }

});