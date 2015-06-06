//KB.Backbone.ModuleBrowserModuleDescription
var Templates = require('common/Templates');
var tplModuleTemplateDescription = require('templates/backend/modulebrowser/module-template-description.hbs');
var tplModuleDescription = require('templates/backend/modulebrowser/module-description.hbs');
var tplModulePoster = require('templates/backend/modulebrowser/poster.hbs');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    this.options.browser.on('browser:close', this.close, this);
  },
  update: function () {
    var that = this;
    this.$el.empty();
    if (this.model.get('template')) {
      this.$el.html(tplModuleTemplateDescription( {module: this.model.toJSON()}));
    } else {
      this.$el.html(tplModuleDescription({module: this.model.toJSON()}));
    }
    if (this.model.get('settings').poster !== false) {
      this.$el.append(tplModulePoster({module: this.model.toJSON()}));
    }
    if (this.model.get('settings').helpfile !== false) {
      this.$el.append(Templates.render(this.model.get('settings').helpfile, {module: this.model.toJSON()}));
    }


  },
  close: function () {
//        this.unbind();
//        this.remove();
//        delete this.$el;
//        delete this.el;
  }
});
