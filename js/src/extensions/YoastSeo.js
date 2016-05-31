var Index = require('common/Index');
KBFieldContent = function () {
  var that = this;
  YoastSEO.app.registerPlugin('kbfieldcontent', {status: 'ready'});

  /**
   * @param modification    {string}    The name of the filter
   * @param callable        {function}  The callable
   * @param pluginName      {string}    The plugin that is registering the modification.
   * @param priority        {number}    (optional) Used to specify the order in which the callables
   *                                    associated with a particular filter are called. Lower numbers
   *                                    correspond with earlier execution.
   */
  YoastSEO.app.registerModification('content', this.contentModification, 'kbfieldcontent', 5);
  if (KB.ChangeObserver) {
    KB.ChangeObserver.on('change', function () {
      // YoastSEO.app.refresh();
    });
  }

};

/**
 * @param data The data to modify
 */
KBFieldContent.prototype.contentModification = function (data) {
  return data + Index.concatStrings();
};

jQuery(document).ready(function () {
  if (window.YoastSEO) {
    new KBFieldContent();
  }
});
