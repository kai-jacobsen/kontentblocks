var BaseView = require('backend/Views/BaseControlView');
var tplTemplatesStatus = require('templates/backend/status/templates.hbs');
var CodemirrorOverlay = require('backend/Views/TemplateEditor/CodemirrorOverlay');
module.exports = BaseView.extend({
  controller: null,
  className: 'kb-status-templates',
  initialize: function (options) {
    this.moduleView = options.parent;
    this.views = this.prepareViews();
    this.openEditor();
  },
  events: {
    'dblclick': 'openEditor'
  },
  isValid: function () {
    return true;
  },
  render: function () {
    var show = (_.size(this.model.get('views')) > 1);
    this.$el.append(tplTemplatesStatus({show: show, module: this.model.toJSON(), views: this.views}));
  },
  openEditor: function () {
    var editor = new CodemirrorOverlay({views: this.views, module: this.model});
  },
  prepareViews: function () {
    return _.map(this.model.get('views'), function (view) {
      view.selected = (view.filename === this.model.get('viewfile')) ? 'selected="selected"' : '';
      view.isActive = (view.filename === this.model.get('viewfile'));
      return view;
    }, this);

  }

});