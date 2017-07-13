module.exports = Backbone.View.extend({
  initialize: function (options) {
    this.controller = options.controller;
    this.area = options.area;
    this.render();
  },
  render: function () {
    var $source, $target, $sourcecontainer, $targetcontainer;
    var that = this;
    this.$('.kbml-slot').draggable({
      revert: 'invalid',
      helper: 'clone',
      revertDuration: 200,
      start: function () {
        $source = jQuery(this).find('.kb-submodule');
        $sourcecontainer = jQuery(this);
        jQuery(this).addClass('being-dragged');
      },
      stop: function () {
        $source = null;
        jQuery(this).removeClass('being-dragged');
      }
    });

    this.$('.kbml-slot').droppable({
      hoverClass: 'drop-hover',
      over: function (event, ui) {
        $target = jQuery(event.target).find('.kb-submodule');
        $targetcontainer = jQuery(this);
      },
      drop: function (event, ui) {

        $source.detach();
        $target.detach();

        $sourcecontainer.append($target);
        $targetcontainer.append($source);

        that.reindex();

        return false;
      }
    });
  }
});