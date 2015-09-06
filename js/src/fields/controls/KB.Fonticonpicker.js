KB.Fields.registerObject('Fonticonpicker', (function ($) {
  return {
    init: function () {
      $('.kb-fonticonpicker').fontIconPicker({
        source: ['icon-heart', 'icon-search', 'icon-user', 'icon-tag', 'icon-help'],
        emptyIcon: false,
        hasSearch: false
      });
    },
    update: function () {
      this.init();
    },
    frontUpdate: function (view) {
      this.init();
    }

  };
}(jQuery)));

