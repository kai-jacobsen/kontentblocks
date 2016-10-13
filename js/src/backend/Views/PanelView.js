var Logger = require('common/Logger');
var FieldsRendererSections = require('backend/Views/Renderer/FieldsRendererSections');
module.exports = Backbone.View.extend({

  initialize: function () {
    this.open = true;
    this.model.View = this;
    this.setupRenderer();
  },
  getDirty: function () {
    Logger.Debug.info('Panel data dirty');
  },
  getClean: function () {
    Logger.Debug.info('Panel data clean');
  },
  setupRenderer: function () {
    var data = this.$el.data();
    if (data && data.kbFieldRenderer && data.kbFieldRenderer === 'fields-renderer-sections') {
      new FieldsRendererSections({
        el: this.el
      })
    }
  },
  isOpen: function () {
    return this.open;
  }

});