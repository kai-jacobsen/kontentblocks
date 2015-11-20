var tplModuleView = require('fields/controls/mlayout/templates/module-view.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var TinyMCE = require('common/TinyMCE');
var Payload = require('common/Payload');
var FullscreenView = require('backend/Views/FullscreenView');
var UI = require('common/UI');

module.exports = Backbone.View.extend({
  events: {
    'click .kbms-action--open': 'openForm',
    'click .kbms-action--delete': 'removeModule'
  },
  tagName: 'div',
  className: 'kb-submodule',
  initialize: function (options) {
    this.formLoaded = false;
    this.slotView = options.slotView;
    this.controller = options.slotView.controller;
  },
  render: function () {
    var that = this;
    this.$el.append(tplModuleView({module: this.model.toJSON()}));
    this.slotView.$el.prepend(this.$el);
    _.defer(function () {
      that.setupElements();
    });
  },
  setupElements: function () {
    this.$inner = this.$('.kbsm-inner');
  },
  openForm: function () {
    if (KB.EditModalModules) {
      this.handleFrontend();
    } else {
      this.handleBackend();
    }
  },
  handleBackend: function () {
    if (this.formLoaded) {
      this.open();
    } else {
      data = {
        action: 'getModuleBackendForm',
        _ajax_nonce: Config.getNonce('read'),
        module: this.model.toJSON()
      };
      Ajax.send(data, this.success, this);
    }
  },
  handleFrontend: function () {
    var model = KB.Modules.get(this.model.get('mid'));
    KB.EditModalModules.openView(model.View);
  },
  success: function (res) {
    this.$inner.hide().append(res.data.html);
    var model = KB.ObjectProxy.add(KB.Modules.add(this.model.toJSON()));
    _.defer(function () {
      Payload.parseAdditionalJSON(res.data.json);
    });
    this.formLoaded = true;
    TinyMCE.addEditor(this.$el);

    this.ModuleModel = model;
    this.open();
  },
  open: function () {
    if (!Config.get('frontend')) {
      if (!this.fsControl) {
        this.fsControl = new FullscreenView({model: this.ModuleModel});
      }
      this.fsControl.open();
    }

    this.listenToOnce(this.fsControl, 'close', this.saveModule);
    UI.repaint(this.fsControl.$el);
  },
  saveModule: function () {

    if (KB.EditModalModules) {
      tinyMCE.triggerSave();
      var $form = KB.EditModalModules.$form;
      var formdata = $form.serializeJSON();
      var moddata = formdata[this.ModuleModel.get('mid')];
      if (moddata) {
        //delete moddata.viewfile;
        //delete moddata.overrides;
        //delete moddata.areaContext;
        this.ModuleModel.set('moduleData', moddata);
        this.ModuleModel.sync(true);
      }
    }
    this.ModuleModel.sync();
  },
  removeModule: function (e) {
    this.slotView.removeModuleView(e);
  }

});