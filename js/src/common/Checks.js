var Config = require('common/Config');
module.exports = {
  blockLimit: function (areamodel) {
    var limit = areamodel.get('limit');
    // todo potentially wrong, yeah it's wrong
    var children = $('#' + areamodel.get('id') + ' li.kb-module').length;
    return !(limit !== 0 && children === limit);


  },
  userCan: function (cap) {
    var check = jQuery.inArray(cap, Config.get('caps'));
    return check !== -1;
  }
}