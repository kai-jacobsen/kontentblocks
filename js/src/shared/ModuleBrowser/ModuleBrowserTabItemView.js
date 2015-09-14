var ModuleBrowserList = require('shared/ModuleBrowser/ModuleBrowserList');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.options = options || {};
    if (this.model.get('listRenderer')) {
      var renderer = this.model.get('listRenderer');
      this.listRenderer = new renderer({cat: this, el: options.browser.$list, browser: options.browser});
    } else {
      this.listRenderer = new ModuleBrowserList({cat: this, el: options.browser.$list, browser: options.browser});
    }
  },
  tagName: 'li',
  className: 'cat-item',
  events: {
    'click': 'change'
  },
  change: function () {
    this.options.parent.trigger('browser:change', this);
    this.$el.addClass('active');
    jQuery('li').not(this.$el).removeClass('active');
  },
  render: function () {
    var count = _.keys(this.model.get('modules')).length;
    var countstr = '(' + count + ')';

    if (count === 0) {
      return false;
    }

    if (this.options.parent.catSet === false) {
      this.options.parent.catSet = true;
      this.options.browser.update(this);
      this.$el.addClass('active');
    }

    this.options.parent.$list.append(this.$el.html(this.model.get('name') + '<span class="module-count">' + countstr + '</span>'));
  },
  renderList: function () {
    this.listRenderer.update();
  }
});