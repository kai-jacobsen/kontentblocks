//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  className: 'kb-status-draft',
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append('<span class="kb-module--status-label">Original Module Name</span>' + this.model.get('settings').publicName);
  }

});