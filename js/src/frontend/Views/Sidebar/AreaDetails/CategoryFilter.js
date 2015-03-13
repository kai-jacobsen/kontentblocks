KB.Backbone.Sidebar.CategoryFilter = Backbone.View.extend({
  categories: KB.Payload.getPayload('ModuleCategories'),
  definitions: KB.payload.getPayload('ModuleDefinitions'),
  initialize: function () {
    this.setupSortTable();
  },
  filter: function (AreaModel) {
    var that = this;
    var sorted = this.setupSortTable();
    var assigned = AreaModel.get('assignedModules');
    _.each(this.definitions, function (def, name) {
      if (_.indexOf(assigned, name) !== -1) {
        sorted[def.settings.category].modules[name] = def;
      }
    });
    return new Backbone.Model(this.removeEmptyCats(sorted));
  },
  setupSortTable: function () {
    var coll = {}
    _.each(this.categories, function (name, key) {
      coll[key] = {
        name: name,
        id: key,
        modules: {}
      }
    });
    return coll;
  },
  removeEmptyCats: function (sorted) {
    _.each(sorted, function (obj, id) {
      if (_.isEmpty(obj.modules)) {
        delete sorted[id];
      }
    });
    if (sorted.core) {
      delete sorted['core'];
    }
    return sorted;
  }
});