var Utilities = require('common/Utilities');
module.exports = Backbone.Collection.extend({
  initialize: function () {
    this.listenTo(this, 'add', this.modelAdded);
    this.listenTo(this, 'remove', this.modelRemove);

  },
  modelAdded: function (model) {
    var value = this.getStorage() || {};
    value[model.get('hash')] = model.toJSON();
    this.setStorage(value);
  },
  modelRemove: function(model){
    var value = this.getStorage() || {};
    if (value[model.get('hash')]){
      delete value[model.get('hash')];
      this.setStorage(value);
    }
  },
  fetch: function () {
    var storage;
    this.ensureStorage();
    if (storage = this.getStorage()) {
      _.each(storage, function (module) {
        if (module.mid) {
          this.add(module, {silent: true});
        }
      }, this)
    }
  },
  ensureStorage: function () {
    var storage = this.getStorage();
    if (!storage) {
      this.clean();
    }
  },
  clean: function () {
    this.reset();
  },
  getStorage: function () {
    return Utilities.store.get('kb-clipboard') || null;
  },
  setStorage: function (val) {
    var value = val || {};
    Utilities.store.set('kb-clipboard', value);
  }
});