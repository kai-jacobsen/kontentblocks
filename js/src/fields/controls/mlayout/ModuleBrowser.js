var ModuleBrowser = require('shared/ModuleBrowser/ModuleBrowserController');
var Checks = require('common/Checks');
var Config = require('common/Config');
var Notice = require('common/Notice');
var Ajax = require('common/Ajax');
module.exports = ModuleBrowser.extend({
  createModule: function (module) {
    var Area, data;
    // check if capability is right for this action
    if (Checks.userCan('create_kontentblocks')) {
    } else {
      Notice.notice('You\'re not allowed to do this', 'error');
    }

    // check if block limit isn't reached

    // prepare data to send
    data = {
      action: 'createNewModule',
      'class': module.get('settings').class,
      globalModule: module.get('globalModule'),
      parentObject: module.get('parentObject'),
      parentObjectId: module.get('parentObjectId'),
      areaContext: this.area.model.get('context'),
      area: this.area.model.get('id'),
      _ajax_nonce: Config.getNonce('create'),
      frontend: KB.appData.config.frontend,
      submodule: true
    };

    if (this.area.model.get('parent_id')) {
      data.postId = this.area.model.get('parent_id');
    }

    this.close();
    Ajax.send(data, this.success, this);
  },
  success: function (res) {
    this.trigger('browser.module.created', { res: res})
  }

});