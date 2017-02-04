var tplSettingsModal = require('templates/backend/status/settings/modal-inner.hbs');
var SettingsTabController = require('./SettingsTabsController');
var LoggedInOnly = require('./controls/LoggedInOnly');
var WrapperClasses = require('./controls/WrapperClasses');
module.exports = Backbone.View.extend({
  tagName: 'div',
  className: 'kb-status-settings-modal kb-hide',
  events: {
    'click .kb-modal-close': 'close'
  },
  rendered: false,
  initialize: function (options) {
    this.listenTo(this.model, 'remove', this.dispose);
    this.moduleView = options.moduleView;
    this.$el.attr('id', this.model.get('mid') + '-settings-modal');
    this.$el.append(tplSettingsModal({model: this.model.toJSON(), i18n: KB.i18n}));
    this.tabController = new SettingsTabController({
      controller: this,
      model: this.model,
      el: this.$('.kb-status-settings--tab-nav')
    });
    this.setupTabItems();
  },
  setupTabItems: function () {
    this.tabController.addItem({id: 'visibility', 'label': KB.i18n.Modules.settings.label.visibility}, new LoggedInOnly({
      model: this.model,
      controller: this,
      bindId: 'loggedinonly'
    }));

    this.tabController.addItem({id: 'details', 'label': KB.i18n.Modules.settings.label.details}, new WrapperClasses({
      model: this.model,
      controller: this,
      bindId: 'wrapperclasses'
    }));

  },
  open: function () {
    if (!this.rendered) {
      this.$el.appendTo('body').removeClass('kb-hide');
      this.rendered = true;
      this.bindHandlers();
      this.tabController.$el.tabs();
    } else {
      this.$el.detach();
      this.$el.appendTo('body');
      this.$el.removeClass('kb-hide');
      this.tabController.$el.tabs('enable');
    }
    jQuery('#wpwrap').addClass('module-browser-open');

    return this;
  },
  close: function () {
    this.$el.detach();
    this.$el.appendTo(this.moduleView.$el);
    this.$el.addClass('kb-hide');
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.tabController.$el.tabs('disable');

    return this;
  },
  dispose: function () {
    delete this.model;
    delete this.moduleView;
    this.remove();
  },
  bindHandlers: function () {
    var that = this;

    that.$inputs = that.$('input');
    that.$inputs.on('change', function () {
      var $el = jQuery(this);
      var key = $el.data('kbms-key');
      var val = $el.val();
      var type = $el.attr('type');

      switch (type) {
        case 'checkbox':
          that.moduleView.model.get('overrides')[key] = $el.is(':checked');
          break;
        default:
          that.moduleView.model.get('overrides')[key] = val;
          break;
      }
      that.moduleView.trigger('kb::module.input.changed');
      that.model.trigger('override:' + key);
    });

  }
});