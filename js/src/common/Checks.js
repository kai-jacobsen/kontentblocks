var Config = require('common/Config');
module.exports = {
  blockLimit: function (areamodel) {
    var limit = areamodel.get('limit');
    // todo potentially wrong, yeah it's wrong
    var children = jQuery('#' + areamodel.get('id') + ' li.kb-module').length;
    return !(limit !== 0 && children === limit);


  },
  userCan: function (cap) {

    return true;
    if (cap === '') {
      return true;
    }

    if (_.isString(cap)) {
      cap = [cap];
    }
    var valid = _.filter(cap, function (c) {

      var check = jQuery.inArray(c, Config.get('caps'));
      return check !== -1;
    })
    return valid.length ===  cap.length;

  }
}