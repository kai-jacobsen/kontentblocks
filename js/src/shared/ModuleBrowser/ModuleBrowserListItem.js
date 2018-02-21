//KB.Backbone.ModuleBrowserListItem
var tplTemplateListItem = require('templates/backend/modulebrowser/module-template-list-item.hbs');
var tplListItem = require('templates/backend/modulebrowser/module-list-item.hbs');
var tplModulePoster = require('templates/backend/modulebrowser/poster.hbs');

module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'modules-list-item',
  initialize: function (options) {
    this.options = options || {};
    this.Browser = options.browser;
    // shorthand to parent area
    this.area = options.browser.area;
    // listen to browser close event
//        this.options.parent.options.browser.on('browser:close', this.close, this);
  },
  // render list
  render: function (el) {
    console.log(this.model);
    if (this.model.get('globalModule')) {
      this.$el.html(tplTemplateListItem({module: this.model.toJSON(), i18n: KB.i18n}));
    } else {
      this.$el.html(tplListItem({module: this.model.toJSON(), i18n: KB.i18n}));
    }
    el.append(this.$el);

    if (this.model.get('settings').poster !== false) {
      this.$el.qtip({
        content: {
          text: tplModulePoster({module: this.model.toJSON()}),
        },
        style: {
          classes: 'kb-qtip'
        },
        position:{
          my: 'top left',
          at: 'bottom right',
          target: 'mouse',
          adjust:{
            x: 80,
            y: 20
          }
        }
      });
    }

  },
  events: {
    'click': 'handleClick',
    'click .kb-js-create-module': 'handlePlusClick'
  },
  handleClick: function () {
    if (this.Browser.viewMode === 'list') {
      this.createModule();
    } else {
      this.Browser.loadDetails(this.model);
    }
  },
  handlePlusClick: function () {
    if (this.Browser.viewMode === 'list') {
      this.handleClick();
      return false;
    } else {
      this.createModule();
    }
  },
  createModule: function () {
    this.Browser.createModule(this.model);
  },
  close: function () {
    this.remove();
  }

});