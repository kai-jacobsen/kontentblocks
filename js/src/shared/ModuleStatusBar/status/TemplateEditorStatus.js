var BaseView = require('backend/Views/BaseControlView');
var CodemirrorOverlay = require('backend/Views/TemplateEditor/CodemirrorOverlay');
var Config = require('common/Config');
var Checks = require('common/Checks');

module.exports = BaseView.extend({
  id: 'templateEditor',
  controller: null,
  className: 'kb-status-settings',
  events: {
    'click': 'openController'
  },
  initialize: function (options) {
    this.moduleView = options.parent;
  },
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }

    if (this.model.get('class') === "ModuleGlobalModuleProxy"){
      return false;
    }
    return Config.get('moduleTemplateEditor');
  },
  render: function () {
    this.$el.append('' +
      '<span class="kb-module--status-label kb-cursor-pointer">Template Editor</span>' +
      '<br>' +
      '<span class="dashicons dashicons-editor-code kb-cursor-pointer"></span>');
  },
  openController: function () {
    var editor = new CodemirrorOverlay({module: this.model, moduleView: this.moduleView});
  }

});