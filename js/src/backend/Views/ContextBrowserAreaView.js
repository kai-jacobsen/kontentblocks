var tplGlobalAreaItem = require('templates/backend/cb-global-area-item.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var Notice = require('common/Notice');
module.exports = Backbone.View.extend({
  tagName: 'li',
  initialize: function (options) {
    this.Browser = options.Browser;
    this.listenTo(this.model, 'change:settings', this.visibility)
  },
  events: {
    'click': 'add'
  },
  visibility: function () {
    if (this.model.get('settings').attached) {
      this.$el.hide();
    } else {
      this.$el.show();
    }
  },
  render: function () {
    this.$el.append(tplGlobalAreaItem({item: this.model.toJSON(), i18n: KB.i18n}));
    this.$el.appendTo(this.Browser.$list);
    this.visibility();
  },
  add: function () {
    var settings = _.clone(this.model.get('settings'));
    settings.attached = true;
    Ajax.send({
      action: 'getGlobalAreaHTML',
      _ajax_nonce: Config.getNonce('update'),
      areaId: this.model.get('id'),
      settings: settings
    }, this.success, this);
  },
  success: function (res) {
    if (res.success) {
      this.model.set('settings', res.data.settings);
      this.Browser.Controller.$inner.append(res.data.html);
      this.Browser.close();
      this.model.View.resetElement();
      Notice.notice('Area attached', 'success');
    } else {
      Notice.notice(res.message, 'error');
    }
  }
});