var Utilities = require('common/Utilities');
module.exports = {
  getString: function (path) {
    if (!path || !KB || !KB.i18n) {
      return null;
    }
    return Utilities.getIndex(KB.i18n, path);
  }
};