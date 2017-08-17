//KB.Backbone.Shared.LoadingAnimation
module.exports = Backbone.View.extend({
  $overlay: jQuery('<div class="kb-loading-overlay" style="display: none;"><span>working...</span></div>'),
  initialize: function () {
    this.$el.css('position', 'relative').append(this.$overlay);
  },
  show: function (opacity) {
    if (opacity) {
      this.$overlay.fadeTo(150, opacity);
    } else {
      this.$overlay.show();
    }

  },
  hide: function () {
    this.$overlay.fadeOut(350);
  },
  remove: function () {
    this.$overlay.remove();
  }
});