var BaseView = require('backend/Views/BaseControlView');
var tplTemplatesStatus = require('templates/backend/status/templates.hbs');
var CodemirrorOverlay = require('backend/Views/TemplateEditor/CodemirrorOverlay');
module.exports = BaseView.extend({
  id: 'templates',
  controller: null,
  className: 'kb-status-templates',
  initialize: function (options) {
    this.moduleView = options.parent;
    this.views = this.prepareViews(this.model.get('views'));
  },
  attributes:{
    'aria-label': 'Modultemplate Auswahl'
  },
  events: {
    'dblclick': 'openEditor'
  },
  isValid: function () {
    return true;
  },
  render: function (views) {
    var selectViews = views || this.views;
    var show = (_.size(selectViews) > 1);
    this.$el.empty().append(tplTemplatesStatus({show: show, module: this.model.toJSON(), views: selectViews}));
  },
  openEditor: function () {
    var editor = new CodemirrorOverlay({views: this.views, module: this.model});
  },
  prepareViews: function (views) {
    return _.map(views, function (view) {
      view.selected = (view.filename === this.model.get('viewfile')) ? 'selected="selected"' : '';
      view.isActive = (view.filename === this.model.get('viewfile'));
      return view;
    }, this);
  }
});