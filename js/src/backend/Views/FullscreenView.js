var tplFullscreenInner = require('templates/backend/fullscreen-inner.hbs');
var TinyMCE = require('common/TinyMCE');
module.exports = Backbone.View.extend({
  className: 'kb-fullscreen--holder',
  initialize: function () {
    this.$parent = this.model.View.$el;
    this.$body = jQuery('.kb-module__body', this.$parent);
    return this;

  },
  events: {
    'click .kb-fullscreen-js-close': 'close'
  },
  open: function () {
    var that = this;
    TinyMCE.removeEditors();
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    this.$fswrap = jQuery(tplFullscreenInner()).appendTo(this.$el);
    this.$fswrap.width(jQuery(window).width() * 0.8);
    this.$body.detach().appendTo(this.$fswrap.find('.kb-fullscreen--inner')).show().addClass('kb-module--fullscreen');
    jQuery(window).resize(function () {
      that.$fswrap.width(jQuery(window).width() * 0.8);
    });
    this.$el.appendTo('body');
    TinyMCE.restoreEditors();

  },
  close: function () {
    TinyMCE.removeEditors();
    this.$body.detach().appendTo(this.$parent);
    this.$backdrop.remove();
    this.$fswrap.remove();
    this.$el.detach();
    setTimeout(function(){
      TinyMCE.restoreEditors();
    }, 250);

  }
});