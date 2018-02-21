var ToggleSection = require('backend/Views/Renderer/ToggleSection');
module.exports = Backbone.View.extend({

  initialize: function () {
    this.quicknav = this.$('ul.kbf-sections-quicknav');
    this.sections = this.setupSections()
  },
  setupSections: function () {
    var that = this;
    var $toggles = this.$('[data-kb-toggle-trigger]');
    var sections = [];
    _.each($toggles, function (el) {
      var $el = jQuery(el);
      var uid = $el.data('kb-toggle-trigger');
      var $con = this.$('[data-kb-toggle-container="' + uid + '"]');
      var title = $el.find('h2').text();
      var id = $el.parent().attr('id');

      setTimeout(function () {
        if ($el.is(':visible')){
          that.quicknav.append('<li><a href="#' + id + '">' + title + '</a></li>');
        }
      },120);


      sections.push(new ToggleSection({
        el: $con,
        $toggle: jQuery(el),
        uid: uid
      }));

    }, this);
    return sections;
  }

});