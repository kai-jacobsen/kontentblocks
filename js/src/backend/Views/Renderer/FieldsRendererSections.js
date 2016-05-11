var ToggleSection = require('backend/Views/Renderer/ToggleSection');
module.exports = Backbone.View.extend({

  initialize: function () {
    this.sections = this.setupSections()
  },
  setupSections: function () {
    var $toggles = this.$('[data-kb-toggle-trigger]');
    var sections = [];
    _.each($toggles, function (el) {
      var uid = jQuery(el).data('kb-toggle-trigger');
      var $con = this.$('[data-kb-toggle-container="' + uid + '"]');

      sections.push(new ToggleSection({
        el: $con,
        $toggle: jQuery(el),
        uid: uid
      }));

    }, this);

    return sections;
  }

});