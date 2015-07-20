var Logger = require('common/Logger');
module.exports = Backbone.View.extend({

  initialize: function(){
    this.model.View = this;
  },
  getDirty: function(){
    Logger.Debug.info('Panel data dirty');
  },
  getClean: function(){
    Logger.Debug.info('Panel data clean');
  }

});