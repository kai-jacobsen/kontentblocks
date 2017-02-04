var BaseView = require('backend/Views/BaseControlView');
var tplDraftStatus = require('templates/backend/status/draft.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var I18n = require('common/I18n');
module.exports = BaseView.extend({
  // id: 'draft',
  className: 'kb-status-draft',
  events: {
    'click': 'toggleDraft'
  },
  isValid: function () {
    return true;
  },
  render: function () {
    var draft = this.model.get('state').draft;
    var $parent = this.model.View.$el;
    this.$el.append(tplDraftStatus({draft: this.model.get('state').draft, strings: I18n.getString('Modules.tooltips')}));
    if (draft){
      $parent.addClass('kb-module-draft');
    } else {
      $parent.removeClass('kb-module-draft');
    }
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