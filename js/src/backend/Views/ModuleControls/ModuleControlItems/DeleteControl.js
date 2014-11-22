KB.Backbone.Backend.ModuleDelete = KB.Backbone.Backend.ModuleMenuItemView.extend({
  className: 'kb-delete block-menu-icon',
  initialize: function () {
    _.bindAll(this, "yes", "no");
  },
  events: {
    'click': 'deleteModule'
  },
  deleteModule: function () {
    KB.Notice.confirm(KB.i18n.EditScreen.notices.confirmDeleteMsg, this.yes, this.no, this);
  },
  isValid: function () {
    if (!this.model.get('predefined') && !this.model.get('disabled') &&
      KB.Checks.userCan('delete_kontentblocks')) {
      return true;
    } else {
      return false;
    }
  },
  yes: function () {
    KB.Ajax.send({
      action: 'removeModules',
      _ajax_nonce: KB.Config.getNonce('delete'),
      module: this.model.get('instance_id')
    }, this.success, this);
  },
  no: function () {
    return false;
  },
  success: function () {
    KB.Modules.remove(this.model);
    wp.heartbeat.interval('fast', 2);
    this.model.destroy();
  }
});