var BaseView = require('backend/Views/BaseControlView');
var tplDraftStatus = require('templates/backend/status/draft.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var I18n = require('common/I18n');
var Notice = require('common/Notice');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  id: 'status',
  events: {
    'click': 'toggleDraft'
  },
  isValid: function () {
    if (KB.Environment && KB.Environment.postType === "kb-gmd" ){
      return false;
    }

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
      Notice.notice('Status changed', 'success');
    });
  }

});