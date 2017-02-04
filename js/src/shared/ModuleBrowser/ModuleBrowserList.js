//KB.Backbone.ModuleBrowserModulesList
var ListItem = require('shared/ModuleBrowser/ModuleBrowserListItem');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.cat = options.cat;
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
    var modules = this.cat.model.get('modules');
    console.log(modules);
    modules.sort(function(a,b) {return (a.get('settings').name > b.get('settings').name) ? 1 : ((b.get('settings').name > a.get('settings').name) ? -1 : 0);} );
    _.each(modules, function (module) {
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
  },
  render: function(){
  }
});