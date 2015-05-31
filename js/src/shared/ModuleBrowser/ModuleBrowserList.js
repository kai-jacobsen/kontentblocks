//KB.Backbone.ModuleBrowserModulesList
var ListItem = require('shared/ModuleBrowser/ModuleBrowserListItem');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
  },
  modules: {},
  subviews: {},
  // set modules to render
  setModules: function (modules) {
    this.modules = modules;
    return this;
  },
  // render current modules to list
  update: function () {
    var that = this;
    // flag the first
    var first = false;
    this.$el.empty();
    _.each(this.modules, function (module) {
      that.subviews[module.cid] = new ListItem({
        model: module,
        parent: that,
        browser: that.options.browser
      });


      if (first === false) {
        that.options.browser.loadDetails(module);
        first = !first;
      }
      that.$el.append(that.subviews[module.cid].render(that.$el));
    });
  }
});