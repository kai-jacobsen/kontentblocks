var BaseView = require('backend/Views/BaseControlView');
var tplTemplatesStatus = require('templates/backend/status/templates.hbs');
module.exports = BaseView.extend({
  // id: 'settings',
  controller: null,
  className: 'kb-status-templates',
  events: {
    // 'click' : 'openController'
  },
  initialize: function (options) {
    this.moduleView = options.parent;
  },
  isValid: function () {
    return true;
  },
  render: function () {
    var show = (_.size(this.model.get('views')) > 1);
    var views = _.map(this.model.get('views'), function (view) {
      view.selected = (view.filename === this.model.get('viewfile')) ? 'selected="selected"' : '';
      return view;
    },this);
    this.$el.append(tplTemplatesStatus({show: show, module: this.model.toJSON(), views:views }));
  }

});