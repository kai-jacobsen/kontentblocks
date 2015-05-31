var Utilities = function ($) {
  return {
    // store with expiration
    stex: {
      set: function (key, val, exp) {
        store.set(key, {val: val, exp: exp, time: new Date().getTime()})
      },
      get: function (key) {
        var info = store.get(key)
        if (!info) {
          return null
        }
        if (new Date().getTime() - info.time > info.exp) {
          return null
        }
        return info.val
      }
    },
    setIndex: function (obj, is, value) {
      if (typeof is == 'string')
        return this.setIndex(obj, is.split('.'), value);
      else if (is.length == 1 && value !== undefined)
        return obj[is[0]] = value;
      else if (is.length == 0)
        return obj;
      else
        return this.setIndex(obj[is[0]], is.slice(1), value);
    },
    getIndex: function (obj, s) {
      s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, '');           // strip a leading dot
      var a = s.split('.');
      while (a.length) {
        var n = a.shift();
        if (n in obj) {
          obj = obj[n];
        } else {
          return {};
        }
      }
      return obj;
    },
    // deprecated in favor of kpath
    cleanArray: function (actual) {
      var newArray = new Array();
      for (var i = 0; i < actual.length; i++) {

        if (!_.isUndefined(actual[i]) && !_.isEmpty(actual[i])) {
          newArray.push(actual[i]);
        }
      }
      return newArray;
    },
    sleep: function (milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
          break;
        }
      }
    }
  }

}(jQuery);
module.exports = Utilities;