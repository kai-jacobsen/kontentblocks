var Payload = require('common/Payload');
var Checks = require('common/Checks');

module.exports = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.area = options.area;
  },
  setup: function () {
    this.categories = this.prepareCategories();
    this.sortToCategories();
    return this;
  },
  getModules: function (id) {
    if (this.categories[id]) {
      return this.categories[id].modules;
    }
  },
  getCategories: function () {
    return this.categories;
  },
  sortToCategories: function () {
    var that = this;
    _.each(this.models, function (model) {
      if (!that.validateVisibility(model)) {
        return;
      }
      var cat = (_.isUndefined(model.get('settings').category)) ? 'standard' : model.get('settings').category;
      that.categories[cat].modules.push(model);
    });
  },
  validateVisibility: function (m) {

    if (!Checks.userCan(m.get('settings').cap)){
      return false;
    }

    if (m.get('settings').hidden) {
      return false;
    }

    if (m.get('settings').disabled) {
      return false;
    }
    return !(!m.get('settings').globalModule && this.area.model.get('dynamic'));

  },
  prepareCategories: function () {
    var cats = {};
    var pCats = Payload.getPayload('ModuleCategories');
    _.each(pCats, function (item, key) {
      cats[key] = {
        id: key,
        name: item,
        modules: []
      };
    });
    KB.Events.trigger('module.browser.setup.cats', cats);
    return cats;
  }
});