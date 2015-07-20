var Logger = require('common/Logger');
module.exports = Backbone.View.extend({

  initialize: function(){
    this.model.View = this;
  },
  getDirty: function(){
    Logger.Debug('Panel data dirty');
  },
  getClean: function(){
    Logger.Debug('Panel data clean');
  }

});