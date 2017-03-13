var ModuleBrowser = require('fields/controls/mlayout/ModuleBrowser');
var ModuleView = require('fields/controls/mlayout/ModuleView');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var tplEmpty = require('fields/controls/mlayout/templates/empty.hbs');

module.exports = Backbone.View.extend({
  hasModule: false,
  events: {
    'click': 'click'
  },
  initialize: function (options) {
    this.controller = options.controller;
    this.slotId = options.slotId;
    this.ModuleView = null;
    this.ModuleModel = null;
    this.setup();
    this.render();
    this.listenTo(this.model, 'change', this.updateInput);
  },
  setModule: function (module) {
    if (!_.isNull(module)){
      this.ModuleModel = new Backbone.Model(module);
    }
  },
  updateInput: function () {

    if (this.ModuleModel && this.ModuleModel.get('submodule')) {
      this.ModuleView = new ModuleView({
        slotView: this,
        model: this.model,
        ModuleModel: this.ModuleModel,
        parentModel: this.controller.model.ModuleModel
      });
      this.ModuleView.render();
      this.$('.kbsm-empty').remove();
    } else {
      this.$el.prepend(tplEmpty({}));
    }
    this.$input.val(this.model.get('mid'));
  },
  setup: function () {
    var field = this.controller.model;
    this.basename = field.get('baseId');
    if (field.get('arrayKey')) {
      this.basename = this.basename + '[' + field.get('arrayKey') + ']';
    }
    this.basename = this.basename + '[' + field.get('fieldkey') + ']' + '[slots]' + '[' + this.slotId + '][mid]';
    this.$input = jQuery("<input type='hidden' name='" + this.basename + "'>");
  },
  render: function () {
    this.$el.append(this.$input);
  },
  click: function () {
    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this.controller.area.View
      });
      this.listenTo(this.ModuleBrowser, 'browser.module.created', this.moduleCreated);
    }
    if (!this.ModuleView) {
      this.ModuleBrowser.render();
    }
  },
  dispose: function () {
    // include dispose function
  },
  moduleCreated: function (data) {
    var that = this;
    var res = data.res;
    var module = res.data.module;
    this.setModule(module);
    this.model.set('mid', module.mid);
    _.defer(function(){
      that.trigger('module.created');
    });
  },
  removeModuleView: function (event) {
    event.stopPropagation();

    Ajax.send({
      action: 'removeModules',
      _ajax_nonce: Config.getNonce('delete'),
      module: this.model.get('mid')
    }, this.removeSuccess, this);
  },
  removeSuccess: function (res) {
    if (res.success) {
      //console.log(this.controller.model);
      //this.controller.model.ModuleModel.View.ModuleMenu.getView('save').saveData();
      this.ModuleView.stopListening();
      this.ModuleView.remove();
      this.ModuleView.model = null;
      this.ModuleView = null;
      this.model.clear();
      this.ModuleModel = null;
      this.updateInput();
      this.trigger('module.removed');
    }
  }
});