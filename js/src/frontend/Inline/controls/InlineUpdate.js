var Check = require('common/Checks');
var Config = require('common/Config');
var Logger = require('common/Logger');
module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.visible = false;
    this.options = options || {};
    this.Parent = options.parent;
  },
  className: 'kb-inline-control kb-inline--update',
  events: {
    'click': 'syncFieldModel',
    'mouseenter': 'mouseenter',
    'mouseleave': 'mouseleave'
  },
  render: function () {
      return this.$el;
  },
  syncFieldModel: function (context) {
    var dfr = this.model.sync(this);
    dfr.done(function (res) {
      if (res.success) {
        this.model.getClean();
        _.each(this.model.get('linkedFields'), function (model, i) {
          if (!_.isNull(model)) {
            model.getClean();
          }
        });
      }
    })
  },
  syncModuleModel: function () {
    this.model.get('ModuleModel').sync(true);
    this.Toolbar.getClean();
  },
  isValid: function () {
    return Check.userCan('edit_kontentblocks');
  },
  mouseenter: function () {

  }
});