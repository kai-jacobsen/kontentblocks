var BaseView = require('backend/Views/BaseControlView');
var tplTemplatesStatus = require('templates/backend/status/templates.hbs');
var SettingsController = require('backend/Views/ModuleStatusBar/status/Settings/SettingsStatusController');
module.exports = BaseView.extend({
  id: 'settings',
  controller: null,
  className: 'kb-status-templates',
  events: {
    // 'click' : 'openController'
  },
  initialize: function (options) {
    this.moduleView = options.parent;
  },
  isValid: function () {
    return true;
  },
  render: function () {
    var show = (_.size(this.model.get('views') > 1));
    this.$el.append(tplTemplatesStatus({show: show,module: this.model.toJSON()}));
  },
  openController: function () {
    this.getController().open();
  },
  getController: function () {
    if (!this.controller) {
      this.controller = new SettingsController({moduleView: this.moduleView, model: this.moduleView.model});
    }
    return this.controller;
  }

});