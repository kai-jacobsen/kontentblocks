var BaseView = require('backend/Views/BaseControlView');
var tplDraftStatus = require('templates/backend/status/draft.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  events: {
    'click': 'toggleDraft'
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append(tplDraftStatus({draft: this.model.get('state').draft, i18n: KB.i18n.Modules.notices}));
  },
  toggleDraft: function () {
    var that = this;
    Ajax.send({
      action: 'undraftModule',
      module: this.model.toJSON(),
      _ajax_nonce: Config.getNonce('update')
    }).done(function () {
      that.model.get('state').draft = !that.model.get('state').draft;
      that.$el.empty();
      that.render();
    });
  }

});