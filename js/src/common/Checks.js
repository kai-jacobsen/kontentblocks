KB.Checks = (function ($) {
  return {
    blockLimit: function (areamodel) {
      var limit = areamodel.get('limit');
      // todo potentially wrong, yeah it's wrong
      var children = $('#' + areamodel.get('id') + ' li.kb-module').length;

      if (limit !== 0 && children === limit) {
        return false;
      }

      return true;
    },
    userCan: function (cap) {
      var check = $.inArray(cap, KB.Config.get('caps'));
      return check !== -1;
    }
  };
}(jQuery));