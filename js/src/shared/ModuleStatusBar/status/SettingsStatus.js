var BaseView = require('backend/Views/BaseControlView');
var SettingsController = require('shared/ModuleStatusBar/status/Settings/SettingsStatusController');
var Checks = require('common/Checks');

module.exports = BaseView.extend({
  id: 'settings',
  controller: null,
  className: 'kb-status-settings',
  events: {
    'click' : 'openController'
  },
  initialize: function(options){
    this.moduleView = options.parent;
  },
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }

    if (KB.Environment && KB.Environment.postType === "kb-gmd" ){
      return false;
    }
    return true;
  },
  render: function () {
    this.$el.append('' +
      '<span class="kb-module--status-label kb-cursor-pointer">Settings</span>' +
      '<br>' +
      '<span class="dashicons dashicons-admin-generic kb-cursor-pointer"></span>');
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