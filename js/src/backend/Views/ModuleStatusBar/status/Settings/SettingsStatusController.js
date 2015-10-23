var tplSettingsModal = require('templates/backend/status/settings/modal-inner.hbs');

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
    this.$el.append(tplSettingsModal({model: this.model.toJSON()}));
    this.$el.attr('id', this.model.get('mid') + '-settings-modal');
  },
  open: function () {
    if (!this.rendered) {
      this.$el.appendTo('body').removeClass('kb-hide');
      this.rendered = true;
      this.bindHandlers();
    } else {
      this.$el.detach();
      this.$el.appendTo('body');
      this.$el.removeClass('kb-hide');
    }
    jQuery('#wpwrap').addClass('module-browser-open');

    return this;
  },
  close: function () {
    this.$el.detach();
    this.$el.appendTo(this.moduleView.$el);
    this.$el.addClass('kb-hide');
    jQuery('#wpwrap').removeClass('module-browser-open');

    return this;
  },
  dispose: function () {
    delete this.model;
    delete this.moduleView;
    this.remove();
  },
  bindHandlers: function(){
    var that = this;
    this.$nameInput = this.$('[data-kbms-name]');
    this.$nameInput.on('keyup', function(){
      var val = jQuery(this).val();
      that.moduleView.$('.kb-module-name').val(val);
      that.moduleView.model.setOverride('name', val);
    });
  }
});