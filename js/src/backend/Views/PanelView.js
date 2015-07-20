var Logger = require('common/Logger');
module.exports = Backbone.View.extend({

  initialize: function(){
    this.model.View = this;
  },
  getDirty: function(){
    Logger.info('Panel data dirty');
  },
  getClean: function(){
    Logger.info('Panel data clean');
  }

});