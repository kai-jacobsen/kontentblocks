var BaseView = require('backend/Views/BaseControlView');
var tplSettingsStatus = require('templates/backend/status/settings.hbs');
var SettingsController = require('backend/Views/ModuleStatusBar/status/Settings/SettingsStatusController');
module.exports = BaseView.extend({
  // id: 'settings',
  controller: null,
  className: 'kb-status-settings',
  events: {
    'click' : 'openController'
  },
  initialize: function(options){
    this.moduleView = options.parent;
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append(tplSettingsStatus({}));
  },
  openController: function(){
    this.getController().open();
  },
  getController: function(){
    if (!this.controller){
      this.controller = new SettingsController({moduleView: this.moduleView, model: this.moduleView.model});
    }
    return this.controller;
  }

});