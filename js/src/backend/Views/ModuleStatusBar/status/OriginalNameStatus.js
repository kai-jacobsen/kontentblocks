//KB.Backbone.Backend.ModuleDelete
var BaseView = require('backend/Views/BaseControlView');
module.exports = BaseView.extend({
  id: 'name',
  className: 'kb-status-name  ',
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append('<span class="kb-module--status-label">Original Module Name<br></span>' + this.model.get('settings').publicName);
  }

});