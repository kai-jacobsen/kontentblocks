module.exports = Backbone.Collection.extend({
  _bycontext: {},
  _globalAreas: {},
  initialize: function () {
    this.listenTo(this, 'add', this.categorize);
  },
  categorize: function (model) {
    var context = model.get('context');
    if (!this._bycontext[context]) {
      this._bycontext[context] = {};
    }
    this._bycontext[context][model.get('id')] = model;
    if (model.get('dynamic')) {
      this._globalAreas[model.get('id')] = model;
    }
  },
  getByContext: function (context) {
    if (this._bycontext[context]) {
      return this._bycontext[context];
    }
    return {};
  },
  getGlobalAreas: function () {
    return this._globalAreas;
  }
});