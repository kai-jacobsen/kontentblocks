//KB.Backbone.Backend.ModuleDuplicate
var BaseView = require('backend/Views/BaseControlView');
var Checks = require('common/Checks');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var UI = require('common/UI');
var Payload = require('common/Payload');
module.exports = BaseView.extend({
  className: 'kb-duplicate block-menu-icon',
  events: {
    'click': 'duplicateModule'
  },
  duplicateModule: function () {
    Ajax.send({
      action: 'duplicateModule',
      module: this.model.get('mid'),
      areaContext: this.model.Area.get('context'),
      _ajax_nonce: Config.getNonce('create'),
      'class': this.model.get('class')
    }, this.success, this);

  },
  isValid: function () {
    if (!this.model.get('predefined') && !this.model.get('disabled') &&
      Checks.userCan('edit_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  success: function (res) {
    var m;
    if (!res.success) {
      Notice.notice('Request Error', 'error');
      return false;
    }
    this.parseAdditionalJSON(res.data.json);
    this.model.Area.View.modulesList.append(res.data.html);
    var ModuleModel = KB.Modules.add(res.data.module);
    //var ModuleView = KB.Views.Modules.get(res.data.id);
    this.model.Area.View.attachModuleView(ModuleModel);
    // update the reference counter, used as base number
    // for new modules
    Notice.notice('Module Duplicated', 'success');
    UI.repaint('#' + res.data.module.mid);
    KB.Fields.trigger('update');
  },
  parseAdditionalJSON: function (json) {
    // create the object if it doesn't exist already
    if (!KB.payload.Fields) {
      KB.payload.Fields = {};
    }
    _.extend(KB.payload.Fields, json.Fields);

    if (!KB.payload.fieldData) {
      KB.payload.fieldData = {};
    }
    _.extend(KB.payload.fieldData, json.fieldData);

    Payload.parseAdditionalJSON(json);
  }
});