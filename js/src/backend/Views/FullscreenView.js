var tplFullscreenInner = require('templates/backend/fullscreen-inner.hbs');
var TinyMCE = require('common/TinyMCE');
var UI = require('common/UI');
module.exports = Backbone.View.extend({
  className: 'kb-fullscreen--holder',
  initialize: function () {
    this.$parent = this.model.View.$el;
    this.$body = jQuery('.kb-module__body', this.$parent);
//     this.observer = new MutationObserver(function(mutations) {
//       mutations.forEach(function(mutation) {
//         console.log(mutation.type);
//       });
//     });
//     // configuration of the observer:
//     var config = { attributes: true, childList: true, characterData: true, subtree:true };
//
// // pass in the target node, as well as the observer options
//     this.observer.observe(this.el, config);

    return this;

  },
  events: {
    'click .kb-fullscreen-js-close': 'close',
    'change .kb-template-select': 'viewfileChange'
  },
  viewfileChange: function (e) {
    var that = this;
    this.model.View.viewfileChange(e);
    this.listenToOnce(this.model.View, 'kb:backend::viewUpdated', function () {
      UI.repaint(that.$body);
    });
  },
  open: function () {
    var that = this;
    that.model.View.open = true;
    TinyMCE.removeEditors();
    this.$backdrop = jQuery('<div class="kb-fullscreen-backdrop"></div>').appendTo('body');
    this.$fswrap = jQuery(tplFullscreenInner()).appendTo(this.$el);
    this.$el.width(jQuery(window).width() * 0.7);
    jQuery('#wpwrap').addClass('module-browser-open');
    this.$body.detach().appendTo(this.$fswrap.find('.kb-fullscreen--inner')).show().addClass('kb-module--fullscreen');
    jQuery(window).resize(function () {
      that.$fswrap.width(jQuery(window).width() * 0.7);
    });
    this.$el.appendTo('body');
    TinyMCE.restoreEditors();
    this.trigger('open');
    this.reposition();

    var height = jQuery(window).height();

    jQuery('.kb-nano', this.$el).height(height - 100);
    jQuery('.kb-nano').nanoScroller({preventPageScrolling: true, contentClass: 'kb-nano-content'});
    //jQuery(window).on('scroll', jQuery.proxy(this.reposition, this));
  },
  reposition: function(){
    var st = jQuery(window).scrollTop();
    this.$el.css('top',  st + 30 + 'px');
  },
  close: function () {
    TinyMCE.removeEditors();
    jQuery('#wpwrap').removeClass('module-browser-open');
    this.$body.detach().appendTo(this.$parent);
    this.$backdrop.remove();
    this.$fswrap.remove();
    this.$el.detach();
    jQuery(window).off('scroll', jQuery.proxy(this.reposition, this));
    this.model.View.open = false;

    setTimeout(function () {
      TinyMCE.restoreEditors();
    }, 250);
    this.trigger('close');
  }
});