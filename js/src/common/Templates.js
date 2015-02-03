KB.Templates = (function ($) {

  var templateCache = {};
  var helpfileCache = {};

  function getTmplCache() {
    return templateCache;
  }

  function render(tplName, tplData) {
    var tplString;
    tplData = tplData || {};
    if (!templateCache[tplName]) {
      tplDir = KB.Config.getRootURL() + 'js/templates';
      var tplUrl = tplDir + '/' + tplName + '.hbs?' + KB.Config.getHash();

      // if a full url is given, tplUrl will be overwritten
      var pat = /^https?:\/\//i;
      if (pat.test(tplName)) {
        tplUrl = tplName;
      }

      // read from local storage if available
      if (KB.Util.stex.get(tplUrl)) {
        tplString = KB.Util.stex.get(tplUrl);
      } else {
        // load fresh file
        $.ajax({
          url: tplUrl,
          method: 'GET',
          async: false,
          success: function (data) {
            tplString = data;
            KB.Util.stex.set(tplUrl, tplString, 2 * 1000 * 60);
          }
        });
      }
      templateCache[tplName] = HandlebarsKB.compile(tplString);
    }
    return templateCache[tplName](tplData);
  }


  /*
   * Deprecated
   */
  function helpfile(helpfileUrl) {
    if (!helpfileCache[helpfileUrl]) {

      var helpfileString;
      $.ajax({
        url: helpfileUrl,
        method: 'GET',
        async: false,
        dataType: 'html',
        success: function (data) {
          helpfileString = data;
        }
      });

      helpfileCache[helpfileUrl] = helpfileUrl;
    }
    return helpfileCache[helpfileUrl];
  };

  return {
    render: render,
    helpfile: helpfile
  };
}(jQuery));