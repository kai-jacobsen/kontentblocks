var ModuleBrowser = require('fields/controls/subarea/ModuleBrowser');
var ModuleView = require('fields/controls/subarea/ModuleView');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var tplEmpty = require('fields/controls/subarea/templates/empty.hbs');

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
    if (!_.isNull(module)) {
      this.ModuleModel = new Backbone.Model(module);
    }
  },
  updateInputValue: function (val) {
    this.$input.val(val);
  },
  updateInput: function () {
    this.$container.empty();
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
      this.$container.prepend(tplEmpty({}));
    }
    this.updateInputValue(this.model.get('mid'));
  },
  setup: function () {
    var field = this.controller.model;
    this.basename = field.get('baseId');
    if (field.get('arrayKey')) {
      this.basename = this.basename + '[' + field.get('arrayKey') + ']';
    }
    this.basename = this.basename + '[' + field.get('fieldkey') + ']' + '[slots]' + '[' + this.slotId + '][mid]';
    this.$input = jQuery("<input type='hidden' name='" + this.basename + "'>");
    this.$container = jQuery("<div></div>");
  },
  render: function () {
    this.$el.append(this.$container);
    this.$el.append(this.$input);
  },
  click: function () {
    if (!this.ModuleBrowser) {
      this.ModuleBrowser = new ModuleBrowser({
        area: this.controller.subarea.View,
        subarea: this.controller.subarea.View
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
    _.defer(function () {
      that.setModule(module);
      that.model.set('mid', '');
      that.model.set('mid', module.mid);
      that.trigger('module.created');
      that.listenToOnce(that.controller.model.ModuleModel.View, 'modal.after.nodeupdate', function () {
        _.defer(function () {
          KB.ObjectProxy.add(KB.Modules.add(module));
          that.controller.setupViewConnections();
        })
      });
      KB.Events.trigger('modal.preview');
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
    var that = this;
    if (res.success) {
      //console.log(this.controller.model);
      //this.controller.model.ModuleModel.View.ModuleMenu.getView('save').saveData();
      this.ModuleView.stopListening();
      this.ModuleView.remove();
      this.ModuleView = null;
      delete this.ModuleView;
      this.ModuleModel = null;
      _.defer(function () {
        that.model.set({mid: ''});
      });

      this.trigger('module.removed');
    }
  }
});