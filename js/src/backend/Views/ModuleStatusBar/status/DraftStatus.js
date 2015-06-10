//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
var tplDraftStatus = require('templates/backend/status/draft.hbs');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  events: {
    'click': 'deleteModule'
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append(tplDraftStatus({draft: this.model.get('state').draft, i18n: KB.i18n.Modules.notices}));
  }

});