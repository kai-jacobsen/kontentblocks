var BaseView = require('backend/Views/BaseControlView');
var tplLoggedInStatus = require('templates/backend/status/loggedin.hbs');
var SettingsController = require('backend/Views/ModuleStatusBar/status/Settings/SettingsStatusController');
module.exports = BaseView.extend({
  id: 'loggedIn',
  controller: null,
  className: 'kb-status-loggedin',
  initialize: function(options){
    this.moduleView = options.parent;
    this.listenTo(this.model, 'override:loggedinonly', this.rerender);
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append(tplLoggedInStatus({model: this.model.toJSON()}));
  },
  rerender: function(){
    this.$el.empty();
    this.render();
  }

});