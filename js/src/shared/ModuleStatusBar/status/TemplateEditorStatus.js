var BaseView = require('backend/Views/BaseControlView');
var CodemirrorOverlay = require('backend/Views/TemplateEditor/CodemirrorOverlay');

module.exports = BaseView.extend({
  // id: 'settings',
  controller: null,
  className: 'kb-status-settings',
  events: {
    'click' : 'openController'
  },
  initialize: function (options) {
    this.moduleView = options.parent;
    this.views = this.prepareViews();
  },
  isValid: function () {
    return true;
  },
  render: function () {
    this.$el.append('' +
      '<span class="kb-module--status-label kb-cursor-pointer">Template Editor</span>' +
      '<br>' +
      '<span class="dashicons dashicons-admin-generic kb-cursor-pointer"></span>');
  },
  openController: function(){
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