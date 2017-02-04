var tpl = require('templates/backend/status/settings/wrapperClasses.hbs');
var ControlView = require('./ControlView');
module.exports = ControlView.extend({
  render: function () {
    this.$el.append(tpl({model: this.model.toJSON(), i18n: KB.i18n}));
    return this.$el;
  },
  getOverrideValue: function (event) {
    return this.$('input').val();
  }
});