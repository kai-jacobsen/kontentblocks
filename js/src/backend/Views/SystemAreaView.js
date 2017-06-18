//KB.Backbone.Backend.AreaView
var tplAreaItemPlaceholer = require('templates/backend/area-item-placeholder.hbs');
var tplAreaAddModule = require('templates/backend/area-add-module.hbs');
var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var AreaControls = require('backend/Views/AreaControls/AreaControlsView');
var StatusControl = require('backend/Views/AreaControls/controls/StatusControl');
var DetachControl = require('backend/Views/AreaControls/controls/DetachControl');
var MoveControl = require('backend/Views/AreaControls/controls/MoveControl');
var Checks = require('common/Checks');
module.exports = Backbone.View.extend({
  initialize: function () {
    this.attachedModules = {};
    this.$controlsContainer = this.$('.add-modules');
    this.$modulesList = this.$('#' + this.model.get('id'));
    this.model.View = this;
    this.render();
  },
  render: function () {
  },

  attachModule: function (ModuleModel) {
    this.attachedModules[ModuleModel.cid] = ModuleModel; // add module
    this.listenTo(ModuleModel, 'change:area', this.removeModule); // add listener
    this.trigger('module.attached', ModuleModel);
  },
  removeModule: function (ModuleModel) {
    var id;
    id = ModuleModel.cid;
    if (this.attachedModules[id]) {
      delete this.attachedModules[id]; // remove property
      this.stopListening(ModuleModel, 'change:area', this.removeModule); // remove listener
    }
    this.trigger('module.detached', ModuleModel);
  }

});