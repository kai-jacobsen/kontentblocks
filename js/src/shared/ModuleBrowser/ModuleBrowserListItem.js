//KB.Backbone.ModuleBrowserListItem
var Templates = require('common/Templates');
module.exports = Backbone.View.extend({
  tagName: 'li',
  className: 'modules-list-item',
  initialize: function (options) {
    this.options = options || {};
    // shorthand to parent area
    this.area = options.browser.area;
    // listen to browser close event
//        this.options.parent.options.browser.on('browser:close', this.close, this);
  },
  // render list
  render: function (el) {
    if (this.model.get('template')) {
      this.$el.html(Templates.render('backend/modulebrowser/module-template-list-item', {module: this.model.toJSON()}));
    } else {
      this.$el.html(Templates.render('backend/modulebrowser/module-list-item', {module: this.model.toJSON()}));
    }
    el.append(this.$el);
  },
  events: {
    'click': 'loadDetails',
    'click .kb-js-create-module': 'createModule'
  },
  loadDetails: function () {
    this.options.browser.loadDetails(this.model);
  },
  createModule: function () {
    this.options.browser.createModule(this.model);
  },
  close: function () {
    this.remove();
//        delete this.$el;
//        delete this.el;
  }

});